import "server-only";

import { Resend } from "resend";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendAttestationEmail({
  to,
  attesterName,
  founderName,
  ventureName,
  entryTitle,
  statement,
  attestUrl,
}: {
  to: string;
  attesterName: string;
  founderName: string;
  ventureName: string;
  entryTitle: string;
  statement: string;
  attestUrl: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set");
  }

  const resend = new Resend(apiKey);

  const safeFounder = escapeHtml(founderName);
  const safeVenture = escapeHtml(ventureName);
  const safeTitle = escapeHtml(entryTitle);
  const safeStatement = escapeHtml(statement);
  const safeUrl = escapeHtml(attestUrl);
  const greeting = attesterName
    ? `Hi ${escapeHtml(attesterName)},`
    : "Hi there,";

  const { error } = await resend.emails.send({
    from:
      process.env.RESEND_FROM_EMAIL ||
      process.env.EMAIL_FROM ||
      "Beleg <notifications@belegapp.com>",
    to,
    subject: `${founderName} is asking you to confirm something on Beleg`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 0;">
        <p style="font-size: 15px; color: #333; line-height: 1.6; margin: 0 0 16px;">
          ${greeting}
        </p>
        <p style="font-size: 15px; color: #333; line-height: 1.6; margin: 0;">
          <strong>${safeFounder}</strong> recorded a milestone for <strong>${safeVenture}</strong> on Beleg and is asking you to confirm it happened as described.
        </p>
        <div style="background: #f8f8f6; border: 1px solid #e4e0d8; border-radius: 6px; padding: 20px; margin: 24px 0;">
          <p style="font-size: 13px; color: #888; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 0.05em;">The entry</p>
          <p style="font-size: 16px; color: #111; font-weight: 600; margin: 0 0 12px;">${safeTitle}</p>
          <p style="font-size: 13px; color: #888; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 0.05em;">What they're asking you to confirm</p>
          <p style="font-size: 15px; color: #333; margin: 0; font-style: italic;">&ldquo;${safeStatement}&rdquo;</p>
        </div>
        <a href="${safeUrl}" style="display: inline-block; background: #2DD4A0; color: #06231A; font-weight: 600; font-size: 15px; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 8px 0 24px;">Confirm this entry</a>
        <p style="font-size: 13px; color: #888; line-height: 1.6;">
          Your confirmation will be publicly visible on their proof page, linked to your name and email. You can only confirm once. There is no account to create — just click and confirm.
        </p>
        <hr style="border: none; border-top: 1px solid #e4e0d8; margin: 24px 0;" />
        <p style="font-size: 12px; color: #aaa; line-height: 1.6;">
          Beleg is a sealed record of what ventures actually did — verifiable by anyone. This email was sent because ${safeFounder} listed your email as a witness. If this wasn't expected, you can ignore it.
        </p>
        <p style="font-size: 12px; color: #aaa; line-height: 1.6; word-break: break-all;">
          If the button doesn't work, paste this into your browser:<br />
          <a href="${safeUrl}" style="color: #0e9f6e;">${safeUrl}</a>
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("Resend email error:", error);
    throw error;
  }
}
