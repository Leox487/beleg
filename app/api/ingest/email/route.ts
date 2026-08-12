import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

import { processIncomingEmail } from "@/lib/services/ingestionService";

export const runtime = "nodejs";

type ResendReceivedEvent = {
  type: string;
  data?: {
    email_id?: string;
    to?: string[];
    received_for?: string[];
  };
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
    // Local/dev fallback when signature secret is unset.
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

function pickRecipient(event: ResendReceivedEvent): string {
  const receivedFor = event.data?.received_for?.[0];
  if (receivedFor) return receivedFor.trim().toLowerCase();
  const to = event.data?.to?.[0];
  return to ? to.trim().toLowerCase() : "";
}

export async function POST(request: NextRequest) {
  const resend = getResend();
  if (!resend) {
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
    const { data: email, error } = await resend.emails.receiving.get(emailId);
    if (error || !email) {
      console.error("Failed to fetch received email:", error);
      return NextResponse.json(
        { error: "Failed to fetch email content" },
        { status: 502 },
      );
    }

    const downloadUrl = email.raw?.download_url;
    if (!downloadUrl) {
      return NextResponse.json(
        { error: "Missing raw email download URL" },
        { status: 502 },
      );
    }

    const rawResponse = await fetch(downloadUrl);
    if (!rawResponse.ok) {
      console.error(
        "Failed to download raw email:",
        rawResponse.status,
        await rawResponse.text().catch(() => ""),
      );
      return NextResponse.json(
        { error: "Failed to download raw email" },
        { status: 502 },
      );
    }

    const rawEmail = await rawResponse.text();
    const recipient =
      pickRecipient(event) ||
      email.received_for?.[0]?.trim().toLowerCase() ||
      email.to?.[0]?.trim().toLowerCase() ||
      "";

    const result = await processIncomingEmail(rawEmail, recipient);

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          milestoneId: result.milestoneId,
          dkimVerified: result.dkimVerified,
        },
        { status: 200 },
      );
    }

    const isServerFault = result.error === "Failed to create milestone";
    // Return 200 for expected rejections so Resend does not retry forever.
    return NextResponse.json(
      {
        success: false,
        error: result.error,
        dkimVerified: result.dkimVerified,
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
