import "server-only";

import {
  getDkimPublicKey,
  parseEmailToCanonicalized,
  verifyBody,
  verifyDkimSignature,
} from "dkim-verifier";
import { simpleParser, type AddressObject } from "mailparser";

import { appendEntry } from "@/lib/chain";
import { extractMilestoneFromEmail } from "@/lib/services/extractMilestone";
import sql from "@/lib/supabase";

export interface IngestionResult {
  success: boolean;
  entryId?: string;
  error?: string;
  dkimVerified: boolean;
}

function firstAddress(
  field: AddressObject | AddressObject[] | undefined,
): string | null {
  if (!field) return null;
  const list = Array.isArray(field) ? field : [field];
  const addr = list[0]?.value?.[0]?.address;
  return addr ? addr.trim().toLowerCase() : null;
}

function asDateOnly(d: Date | undefined): string | null {
  if (!d || Number.isNaN(d.getTime())) return null;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function verifyDkim(rawEmail: string): Promise<{
  verified: boolean;
  domain: string | null;
  selector: string | null;
  error: string | null;
}> {
  try {
    const { canonicalizedHeaders, canonicalizedBody, dkim } =
      parseEmailToCanonicalized(rawEmail);

    const bodyOk = verifyBody(canonicalizedBody, dkim);
    if (!bodyOk) {
      return {
        verified: false,
        domain: dkim.d ?? null,
        selector: dkim.s ?? null,
        error: "DKIM body hash mismatch",
      };
    }

    const publicKey = await getDkimPublicKey(dkim);
    const sigOk = verifyDkimSignature(dkim, canonicalizedHeaders, publicKey);

    return {
      verified: sigOk,
      domain: dkim.d ?? null,
      selector: dkim.s ?? null,
      error: sigOk ? null : "DKIM signature verification failed",
    };
  } catch (error) {
    return {
      verified: false,
      domain: null,
      selector: null,
      error:
        error instanceof Error ? error.message : "DKIM verification failed",
    };
  }
}

/**
 * Resolve venture from recipient address:
 * 1) exact match on inbound_endpoints
 * 2) fallback: local-part ends with -[8 hex chars] matching ventures.id prefix
 */
async function resolveVenture(recipient: string): Promise<{
  ventureId: string;
  endpointId: string | null;
} | null> {
  const endpoints = await sql`
    SELECT id, venture_id
    FROM inbound_endpoints
    WHERE lower(email_address) = ${recipient} AND is_active = true
    LIMIT 1
  `;
  if (endpoints[0]) {
    return {
      ventureId: String(endpoints[0].venture_id),
      endpointId: String(endpoints[0].id),
    };
  }

  const local = recipient.split("@")[0] ?? "";
  const match = local.match(/-([0-9a-f]{8})(?:-[a-z0-9]+)?$/i);
  if (!match) return null;
  const idPrefix = match[1].toLowerCase();

  const ventures = await sql`
    SELECT id FROM ventures
    WHERE id::text LIKE ${idPrefix + "%"}
    LIMIT 1
  `;
  if (!ventures[0]) return null;
  return { ventureId: String(ventures[0].id), endpointId: null };
}

export async function processIncomingEmail(
  rawEmail: string,
  recipientEmail: string,
): Promise<IngestionResult> {
  const parsed = await simpleParser(rawEmail);

  const recipient =
    recipientEmail.trim().toLowerCase() ||
    firstAddress(parsed.to) ||
    "";

  if (!recipient) {
    console.warn("ingest: missing recipient address");
    return {
      success: false,
      error: "Missing recipient address",
      dkimVerified: false,
    };
  }

  const resolved = await resolveVenture(recipient);
  if (!resolved) {
    console.warn("ingest: no venture for recipient", recipient);
    return {
      success: false,
      error: "No venture found for recipient",
      dkimVerified: false,
    };
  }

  const { ventureId, endpointId } = resolved;

  const dkim = await verifyDkim(rawEmail);
  if (!dkim.verified) {
    console.warn(
      "ingest: DKIM failed or absent — continuing (v1 soft gate)",
      dkim.error,
    );
  }

  const fromAddress =
    parsed.from?.text ?? firstAddress(parsed.from) ?? null;
  const senderEmail = firstAddress(parsed.from);
  const plainText =
    typeof parsed.text === "string" && parsed.text.trim()
      ? parsed.text
      : null;
  const htmlBody =
    typeof parsed.html === "string" && parsed.html.length > 0
      ? parsed.html
      : null;
  const subjectLine = parsed.subject ?? null;
  const sentAt = parsed.date ?? new Date();

  let ingestedEmailId: string | null = null;
  if (endpointId) {
    const insertRows = await sql`
      INSERT INTO ingested_emails (
        endpoint_id, raw_eml, plain_text_body, html_body, subject_line,
        from_address, sent_at, dkim_verified, dkim_domain, dkim_selector,
        verification_error, status
      ) VALUES (
        ${endpointId},
        ${rawEmail},
        ${plainText},
        ${htmlBody},
        ${subjectLine},
        ${fromAddress},
        ${sentAt.toISOString()},
        ${dkim.verified},
        ${dkim.domain},
        ${dkim.selector},
        ${dkim.error},
        ${dkim.verified ? "verified" : "rejected"}
      )
      RETURNING id
    `;
    ingestedEmailId = String(insertRows[0].id);
  }

  if (!senderEmail) {
    console.warn("ingest: missing From address");
    if (ingestedEmailId) {
      await sql`
        UPDATE ingested_emails
        SET status = 'rejected', verification_error = ${"Missing From address"}
        WHERE id = ${ingestedEmailId}
      `;
    }
    return {
      success: false,
      error: "Missing From address",
      dkimVerified: dkim.verified,
    };
  }

  const whitelist = await sql`
    SELECT 1
    FROM email_whitelist
    WHERE venture_id = ${ventureId}
      AND lower(sender_email) = ${senderEmail}
    LIMIT 1
  `;

  if (!whitelist[0]) {
    console.warn("ingest: sender not whitelisted", senderEmail, ventureId);
    if (ingestedEmailId) {
      await sql`
        UPDATE ingested_emails
        SET status = 'rejected', verification_error = ${"Sender not whitelisted"}
        WHERE id = ${ingestedEmailId}
      `;
    }
    return {
      success: false,
      error: "sender not whitelisted",
      dkimVerified: dkim.verified,
    };
  }

  try {
    const extracted = await extractMilestoneFromEmail({
      subject: subjectLine,
      text: plainText,
    });

    const entry = await appendEntry({
      venture_id: ventureId,
      kind: "email",
      title: extracted.title.slice(0, 200),
      body: extracted.body,
      occurred_at: asDateOnly(sentAt),
      source: "email",
      dkim_verified: dkim.verified,
    });

    if (ingestedEmailId) {
      await sql`
        UPDATE ingested_emails
        SET milestone_id = ${entry.id}, status = 'milestone_created'
        WHERE id = ${ingestedEmailId}
      `;
    }

    if (endpointId) {
      await sql`
        UPDATE inbound_endpoints
        SET last_ingested_at = ${new Date().toISOString()}
        WHERE id = ${endpointId}
      `;
    }

    return {
      success: true,
      entryId: entry.id,
      dkimVerified: dkim.verified,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Entry creation failed";
    console.error("ingest: failed to append entry", error);
    if (ingestedEmailId) {
      await sql`
        UPDATE ingested_emails
        SET status = 'failed', verification_error = ${message}
        WHERE id = ${ingestedEmailId}
      `;
    }
    return {
      success: false,
      error: "Failed to create entry",
      dkimVerified: dkim.verified,
    };
  }
}
