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

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function fromAddress(): string {
  return (
    process.env.RESEND_FROM_EMAIL ||
    process.env.EMAIL_FROM ||
    "Beleg <notifications@belegapp.com>"
  );
}

export async function sendCivicChangeEmail(input: {
  to: string;
  city: string;
  datasetName: string;
  resourceUrl: string;
  oldHash: string;
  newHash: string;
  detectedAt: string;
  auditUrl: string;
}): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.error("RESEND_API_KEY is not set; skipping civic change email");
    return;
  }

  const { error } = await resend.emails.send({
    from: fromAddress(),
    to: input.to,
    replyTo: "beleg.app@proton.me",
    subject: `Beleg civic audit: ${input.city} file content changed`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
        <p>A monitored public file in <strong>${escapeHtml(input.city)}</strong> changed.</p>
        <p><strong>Dataset</strong><br />${escapeHtml(input.datasetName)}</p>
        <p><strong>URL</strong><br /><a href="${escapeHtml(input.resourceUrl)}">${escapeHtml(input.resourceUrl)}</a></p>
        <p><strong>Previous hash</strong><br /><code>${escapeHtml(input.oldHash)}</code></p>
        <p><strong>New hash</strong><br /><code>${escapeHtml(input.newHash)}</code></p>
        <p><strong>Detected</strong><br />${escapeHtml(input.detectedAt)}</p>
        <p>A change means the file bytes changed since last retrieval — not that anything improper occurred.</p>
        <p><a href="${escapeHtml(input.auditUrl)}">Open the city audit</a></p>
      </div>
    `,
  });
  if (error) {
    console.error("Civic change email failed:", error);
  }
}

export async function sendCivicFlagEmail(input: {
  city: string;
  datasetName: string;
  resourceUrl: string;
  reporterName: string;
  reporterEmail: string;
  note: string;
  auditUrl: string;
}): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.error("RESEND_API_KEY is not set; skipping civic flag email");
    return;
  }

  const { error } = await resend.emails.send({
    from: fromAddress(),
    to: "beleg.app@proton.me",
    replyTo: input.reporterEmail,
    subject: `Civic flag: ${input.city} change review`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
        <p>A change was flagged for review.</p>
        <p><strong>City</strong> ${escapeHtml(input.city)}</p>
        <p><strong>Dataset</strong> ${escapeHtml(input.datasetName)}</p>
        <p><strong>URL</strong> ${escapeHtml(input.resourceUrl)}</p>
        <p><strong>Reporter</strong> ${escapeHtml(input.reporterName)} &lt;${escapeHtml(input.reporterEmail)}&gt;</p>
        <p><strong>Note</strong><br />${escapeHtml(input.note)}</p>
        <p><a href="${escapeHtml(input.auditUrl)}">${escapeHtml(input.auditUrl)}</a></p>
      </div>
    `,
  });
  if (error) {
    console.error("Civic flag email failed:", error);
  }
}
