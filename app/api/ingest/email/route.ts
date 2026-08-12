import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

import { processIncomingEmail } from "@/lib/services/ingestionService";

export const runtime = "nodejs";

type ResendReceivedEvent = {
  type: string;
  data?: {
    email_id?: string;
    to?: string[];
    from?: string;
    subject?: string;
    received_for?: string[];
  };
};

type ReceivedEmailPayload = {
  id?: string;
  to?: string[] | null;
  from?: string | null;
  subject?: string | null;
  text?: string | null;
  html?: string | null;
  headers?: Record<string, string> | null;
  received_for?: string[] | null;
  created_at?: string | null;
  raw?: { download_url?: string; expires_at?: string } | null;
};

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function verifyResendWebhook(
  resend: Resend,
  payload: string,
  request: NextRequest,
): ResendReceivedEvent {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    return JSON.parse(payload) as ResendReceivedEvent;
  }

  return resend.webhooks.verify({
    payload,
    headers: {
      id: request.headers.get("svix-id") ?? "",
      timestamp: request.headers.get("svix-timestamp") ?? "",
      signature: request.headers.get("svix-signature") ?? "",
    },
    webhookSecret: secret,
  }) as ResendReceivedEvent;
}

function pickRecipient(
  event: ResendReceivedEvent,
  email: ReceivedEmailPayload,
): string {
  const candidates = [
    ...(event.data?.received_for ?? []),
    ...(event.data?.to ?? []),
    ...(email.received_for ?? []),
    ...(email.to ?? []),
  ];
  for (const c of candidates) {
    const v = (c ?? "").trim().toLowerCase();
    if (v.includes("@")) return v;
  }
  return "";
}

/**
 * Fetch full received-email content. Prefer the Receiving API
 * (`/emails/receiving/:id`); fall back to `/emails/:id` if needed.
 */
async function fetchReceivedEmail(
  apiKey: string,
  emailId: string,
): Promise<{ email: ReceivedEmailPayload | null; error: string | null }> {
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json",
  };

  for (const path of [
    `https://api.resend.com/emails/receiving/${emailId}`,
    `https://api.resend.com/emails/${emailId}`,
  ]) {
    const res = await fetch(path, { headers });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.warn("Received email fetch failed:", path, res.status, body);
      continue;
    }
    const email = (await res.json()) as ReceivedEmailPayload;
    return { email, error: null };
  }

  return { email: null, error: "Failed to fetch email content" };
}

function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  const resend = getResend();
  if (!resend || !apiKey) {
    return NextResponse.json(
      { error: "RESEND_API_KEY is not configured" },
      { status: 500 },
    );
  }

  const payload = await request.text();

  let event: ResendReceivedEvent;
  try {
    event = verifyResendWebhook(resend, payload, request);
  } catch (error) {
    console.error("Resend webhook verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (event.type !== "email.received") {
    return NextResponse.json({ ok: true, ignored: event.type });
  }

  const emailId = event.data?.email_id;
  if (!emailId) {
    return NextResponse.json({ error: "Missing email_id" }, { status: 400 });
  }

  try {
    // Webhook is metadata-only — pull text/html (and optional raw) via API.
    const { email, error } = await fetchReceivedEmail(apiKey, emailId);
    if (error || !email) {
      console.error("Failed to fetch received email:", error);
      return NextResponse.json(
        { error: "Failed to fetch email content" },
        { status: 502 },
      );
    }

    let rawEmail = "";
    const downloadUrl = email.raw?.download_url;
    if (downloadUrl) {
      const rawResponse = await fetch(downloadUrl);
      if (rawResponse.ok) {
        rawEmail = await rawResponse.text();
      } else {
        console.warn(
          "Raw .eml download failed; continuing with API text body",
          rawResponse.status,
        );
      }
    }

    const apiText =
      (typeof email.text === "string" && email.text.trim()
        ? email.text
        : null) ||
      (typeof email.html === "string" && email.html.trim()
        ? htmlToText(email.html)
        : null);

    const recipient = pickRecipient(event, email);
    const fromHeader =
      email.headers?.from ||
      email.from ||
      event.data?.from ||
      null;

    const result = await processIncomingEmail(rawEmail, recipient, {
      subject: email.subject ?? event.data?.subject ?? null,
      text: apiText,
      html: email.html ?? null,
      from: fromHeader,
      date: email.created_at ?? null,
    });

    if (result.success && result.entryId) {
      return NextResponse.json(
        { success: true, entry_id: result.entryId },
        { status: 200 },
      );
    }

    const isServerFault = result.error === "Failed to create entry";
    return NextResponse.json(
      {
        success: false,
        error: result.error,
        dkim_verified: result.dkimVerified,
      },
      { status: isServerFault ? 500 : 200 },
    );
  } catch (error) {
    console.error("Ingestion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
