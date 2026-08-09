// Server-only email sending via the Resend REST API.
//
// Deliberately uses plain fetch rather than the `resend` SDK so Beleg keeps its
// dependency surface small. If the provider is not configured, send() reports
// that instead of throwing — an unsent email must never cost the caller its
// database write.

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export type SendResult =
  | { ok: true; id: string }
  | {
      ok: false;
      reason: "not_configured" | "provider_error" | "network_error";
      message: string;
    };

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string | null;
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/** Escapes a string for safe interpolation into HTML email bodies. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendEmail(message: EmailMessage): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      reason: "not_configured",
      message: "RESEND_API_KEY is not set",
    };
  }

  const from = process.env.EMAIL_FROM ?? "Beleg <onboarding@resend.dev>";

  let res: Response;
  try {
    res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
        ...(message.replyTo ? { reply_to: [message.replyTo] } : {}),
      }),
    });
  } catch (err) {
    return {
      ok: false,
      reason: "network_error",
      message: err instanceof Error ? err.message : "Request failed",
    };
  }

  if (!res.ok) {
    // Resend returns { name, message } on failure; fall back to the status.
    let detail = `Provider returned ${res.status}`;
    try {
      const body = (await res.json()) as { message?: string };
      if (body?.message) detail = body.message;
    } catch {
      // Non-JSON error body; the status text is the best we have.
    }
    return { ok: false, reason: "provider_error", message: detail };
  }

  const body = (await res.json()) as { id?: string };
  return { ok: true, id: body.id ?? "" };
}
