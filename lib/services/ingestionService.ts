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

/** Optional fields from Resend Received Emails API (webhook is metadata-only). */
export interface InboundEmailMeta {
  subject?: string | null;
  text?: string | null;
  html?: string | null;
  from?: string | null;
  date?: string | Date | null;
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

function parseFromHeader(from: string | null | undefined): string | null {
  if (!from) return null;
  const angle = from.match(/<([^>]+)>/);
  const addr = (angle?.[1] ?? from).trim().toLowerCase();
  return addr.includes("@") ? addr : null;
}

/**
 * Resolve venture from recipient `slug@*.resend.app` (or configured domain)
 * by matching ventures.slug to the local-part before @.
 */
async function resolveVenture(recipient: string): Promise<{
  ventureId: string;
  endpointId: string | null;
} | null> {
  const normalized = recipient.trim().toLowerCase();
  const at = normalized.lastIndexOf("@");
  if (at <= 0) return null;
  const local = normalized.slice(0, at).trim();
  const domain = normalized.slice(at + 1).trim();
  if (!local || !domain) return null;

  const expected = (
    process.env.INGEST_EMAIL_DOMAIN ||
    process.env.NEXT_PUBLIC_INGEST_EMAIL_DOMAIN ||
    ""
  )
    .trim()
    .toLowerCase();
  if (expected && domain !== expected) {
    console.warn(
      "ingest: recipient domain mismatch",
      domain,
      "expected",
      expected,
    );
    // Still allow match by slug — Resend may rewrite/forward; local-part is source of truth.
  }

  const ventures = await sql`
    SELECT id
    FROM ventures
    WHERE lower(slug) = ${local}
    LIMIT 1
  `;
  if (!ventures[0]) return null;

  const ventureId = String(ventures[0].id);
  const endpoints = await sql`
    SELECT id
    FROM inbound_endpoints
    WHERE venture_id = ${ventureId} AND is_active = true
    ORDER BY created_at ASC
    LIMIT 1
  `;

  return {
    ventureId,
    endpointId: endpoints[0] ? String(endpoints[0].id) : null,
  };
}

export async function processIncomingEmail(
  rawEmail: string,
  recipientEmail: string,
  meta: InboundEmailMeta = {},
): Promise<IngestionResult> {
  const parsed = rawEmail.trim()
    ? await simpleParser(rawEmail)
    : null;

  const recipient =
    recipientEmail.trim().toLowerCase() ||
    (parsed ? firstAddress(parsed.to) : null) ||
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

  const dkim = rawEmail.trim()
    ? await verifyDkim(rawEmail)
    : {
        verified: false,
        domain: null,
        selector: null,
        error: "No raw .eml for DKIM",
      };
  if (!dkim.verified) {
    console.warn(
      "ingest: DKIM failed or absent — continuing (v1 soft gate)",
      dkim.error,
    );
  }

  const fromAddress =
    meta.from?.trim() ||
    parsed?.from?.text ||
    (parsed ? firstAddress(parsed.from) : null) ||
    null;
  const senderEmail =
    parseFromHeader(meta.from) ||
    (parsed ? firstAddress(parsed.from) : null);

  // Prefer Resend Received Emails API text (webhook has no body).
  const plainText =
    (typeof meta.text === "string" && meta.text.trim()
      ? meta.text
      : null) ||
    (parsed && typeof parsed.text === "string" && parsed.text.trim()
      ? parsed.text
      : null);
  const htmlBody =
    (typeof meta.html === "string" && meta.html.length > 0
      ? meta.html
      : null) ||
    (parsed && typeof parsed.html === "string" && parsed.html.length > 0
      ? parsed.html
      : null);
  const subjectLine =
    (typeof meta.subject === "string" ? meta.subject : null) ||
    parsed?.subject ||
    null;
  const sentAt = (() => {
    if (meta.date instanceof Date && !Number.isNaN(meta.date.getTime())) {
      return meta.date;
    }
    if (typeof meta.date === "string" && meta.date.trim()) {
      const d = new Date(meta.date);
      if (!Number.isNaN(d.getTime())) return d;
    }
    return parsed?.date ?? new Date();
  })();

  // Persist something for audit even when raw download is unavailable.
  const storedRaw = rawEmail.trim() || plainText || htmlBody || "";

  let ingestedEmailId: string | null = null;
  if (endpointId && storedRaw) {
    const insertRows = await sql`
      INSERT INTO ingested_emails (
        endpoint_id, raw_eml, plain_text_body, html_body, subject_line,
        from_address, sent_at, dkim_verified, dkim_domain, dkim_selector,
        verification_error, status
      ) VALUES (
        ${endpointId},
        ${storedRaw},
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
