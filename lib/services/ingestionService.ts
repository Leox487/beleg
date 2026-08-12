import "server-only";

import {
  getDkimPublicKey,
  parseEmailToCanonicalized,
  verifyBody,
  verifyDkimSignature,
} from "dkim-verifier";
import { simpleParser, type AddressObject } from "mailparser";

import { createMilestone } from "@/lib/services/milestoneService";
import sql from "@/lib/supabase";

export interface IngestionResult {
  success: boolean;
  milestoneId?: string;
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
    return {
      success: false,
      error: "Missing recipient address",
      dkimVerified: false,
    };
  }

  const endpoints = await sql`
    SELECT id, venture_id, email_address, is_active
    FROM inbound_endpoints
    WHERE email_address = ${recipient} AND is_active = true
    LIMIT 1
  `;
  const endpoint = endpoints[0] as
    | { id: string; venture_id: string; email_address: string; is_active: boolean }
    | undefined;

  if (!endpoint) {
    return {
      success: false,
      error: "No active endpoint for this recipient",
      dkimVerified: false,
    };
  }

  const ventureId = String(endpoint.venture_id);
  const endpointId = String(endpoint.id);

  const dkim = await verifyDkim(rawEmail);
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
  const ingestedEmailId = String(insertRows[0].id);

  if (!dkim.verified) {
    return {
      success: false,
      error: dkim.error || "DKIM verification failed",
      dkimVerified: false,
    };
  }

  if (!senderEmail) {
    await sql`
      UPDATE ingested_emails
      SET status = 'rejected', verification_error = ${"Missing From address"}
      WHERE id = ${ingestedEmailId}
    `;
    return {
      success: false,
      error: "Missing From address",
      dkimVerified: true,
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
    await sql`
      UPDATE ingested_emails
      SET status = 'rejected', verification_error = ${"Sender not whitelisted"}
      WHERE id = ${ingestedEmailId}
    `;
    return {
      success: false,
      error: "Sender not whitelisted",
      dkimVerified: true,
    };
  }

  if (!plainText) {
    await sql`
      UPDATE ingested_emails
      SET status = 'rejected', verification_error = ${"No plain text body"}
      WHERE id = ${ingestedEmailId}
    `;
    return {
      success: false,
      error: "DKIM verification failed or no plain text body",
      dkimVerified: true,
    };
  }

  try {
    const title =
      (subjectLine && subjectLine.trim()) ||
      plainText.split("\n")[0].slice(0, 60) ||
      "Email milestone";

    const description = [
      "**Auto-ingested from email**",
      "",
      `From: ${fromAddress ?? senderEmail}`,
      `Date: ${sentAt.toISOString()}`,
      `Ingested email id: ${ingestedEmailId}`,
      "",
      plainText.slice(0, 1000) + (plainText.length > 1000 ? "..." : ""),
    ].join("\n");

    const milestone = await createMilestone({
      ventureId,
      title,
      description,
      occurredAt: asDateOnly(sentAt),
    });

    await sql`
      UPDATE ingested_emails
      SET milestone_id = ${milestone.id}, status = 'milestone_created'
      WHERE id = ${ingestedEmailId}
    `;

    await sql`
      UPDATE inbound_endpoints
      SET last_ingested_at = ${new Date().toISOString()}
      WHERE id = ${endpointId}
    `;

    return {
      success: true,
      milestoneId: milestone.id,
      dkimVerified: true,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Milestone creation failed";
    await sql`
      UPDATE ingested_emails
      SET status = 'failed', verification_error = ${message}
      WHERE id = ${ingestedEmailId}
    `;
    return {
      success: false,
      error: "Failed to create milestone",
      dkimVerified: true,
    };
  }
}
