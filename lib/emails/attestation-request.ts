import { escapeHtml } from "@/lib/email";

export interface AttestationEmailInput {
  attesterName: string | null;
  requesterName: string;
  ventureName: string;
  entryTitle: string;
  entryDate: string | null;
  statement: string;
  confirmUrl: string;
  siteUrl: string;
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null;

  // occurred_at is a plain calendar date. Feeding "2026-07-14" to Date() gives
  // UTC midnight, which formats as the 13th anywhere west of Greenwich — so the
  // parts are read directly instead of round-tripping through a timezone.
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (dateOnly) {
    const d = new Date(
      Number(dateOnly[1]),
      Number(dateOnly[2]) - 1,
      Number(dateOnly[3]),
    );
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // recorded_at is an instant; pin it to UTC so the rendered date doesn't
  // depend on which region the server happens to run in.
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function buildAttestationRequestEmail(input: AttestationEmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const {
    attesterName,
    requesterName,
    ventureName,
    entryTitle,
    entryDate,
    statement,
    confirmUrl,
    siteUrl,
  } = input;

  const greeting = attesterName ? `Hi ${attesterName},` : "Hi there,";
  const dateLine = formatDate(entryDate);
  const subject = `${requesterName} asked you to confirm a milestone`;

  const text = [
    greeting,
    "",
    `${requesterName} keeps a record of ${ventureName}'s milestones on Beleg — a running log where every entry is timestamped and sealed, so it can't be quietly edited later. They've recorded this one, and listed you as someone who was there.`,
    "",
    dateLine ? `${entryTitle} (${dateLine})` : entryTitle,
    "",
    "Here's what they're hoping you can confirm:",
    `"${statement}"`,
    "",
    "Confirm it here:",
    confirmUrl,
    "",
    "It takes one click. There's no account to create, no password, and we won't add you to any mailing list. Your confirmation becomes part of the same sealed record, so anyone reviewing it later can see it came from you.",
    "",
    "If something looks wrong, or you'd rather not confirm, you can ignore this email — nothing is recorded unless you click.",
    "",
    "Thanks for taking a moment.",
    "",
    `Sent on behalf of ${requesterName} · Beleg`,
    siteUrl,
  ].join("\n");

  // Inline styles and a fixed-width table: the two things email clients agree on.
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f5f7;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0;">
      ${escapeHtml(requesterName)} would like you to confirm: ${escapeHtml(entryTitle)}
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f5f7; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px; background-color:#ffffff; border:1px solid #e4e6ea; border-radius:10px; overflow:hidden; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
            <tr>
              <td style="padding:28px 32px 0 32px;">
                <p style="margin:0; font-size:15px; font-weight:600; letter-spacing:-0.01em; color:#14171a;">Beleg</p>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 32px 0 32px;">
                <p style="margin:0 0 16px 0; font-size:16px; line-height:1.6; color:#14171a;">${escapeHtml(greeting)}</p>
                <p style="margin:0; font-size:15px; line-height:1.65; color:#4a5057;">
                  <strong style="color:#14171a;">${escapeHtml(requesterName)}</strong> keeps a record of
                  <strong style="color:#14171a;">${escapeHtml(ventureName)}</strong>'s milestones on Beleg — a running log
                  where every entry is timestamped and sealed, so it can't be quietly edited later.
                  They've recorded this one, and listed you as someone who was there.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 32px 0 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fafbfc; border:1px solid #e4e6ea; border-radius:8px;">
                  <tr>
                    <td style="padding:18px 20px;">
                      <p style="margin:0 0 6px 0; font-size:16px; font-weight:600; line-height:1.4; color:#14171a;">${escapeHtml(entryTitle)}</p>
                      ${
                        dateLine
                          ? `<p style="margin:0; font-size:13px; color:#787f87;">${escapeHtml(dateLine)}</p>`
                          : ""
                      }
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 32px 0 32px;">
                <p style="margin:0 0 10px 0; font-size:15px; line-height:1.6; color:#4a5057;">Here's what they're hoping you can confirm:</p>
                <p style="margin:0; padding:0 0 0 14px; border-left:3px solid #2dd4a0; font-size:15px; line-height:1.65; color:#14171a;">${escapeHtml(statement)}</p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:28px 32px 0 32px;">
                <a href="${escapeHtml(confirmUrl)}" style="display:inline-block; padding:13px 28px; background-color:#2dd4a0; color:#06231a; font-size:15px; font-weight:600; text-decoration:none; border-radius:8px;">Confirm this</a>
              </td>
            </tr>

            <tr>
              <td style="padding:22px 32px 0 32px;">
                <p style="margin:0 0 14px 0; font-size:14px; line-height:1.6; color:#4a5057;">
                  It takes one click. There's no account to create, no password, and we won't add you to
                  any mailing list. Your confirmation becomes part of the same sealed record, so anyone
                  reviewing it later can see it came from you.
                </p>
                <p style="margin:0; font-size:14px; line-height:1.6; color:#787f87;">
                  If something looks wrong, or you'd rather not confirm, you can ignore this email —
                  nothing is recorded unless you click.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:22px 32px 28px 32px;">
                <p style="margin:0; font-size:14px; line-height:1.6; color:#4a5057;">Thanks for taking a moment.</p>
              </td>
            </tr>

            <tr>
              <td style="padding:18px 32px 22px 32px; border-top:1px solid #e4e6ea; background-color:#fafbfc;">
                <p style="margin:0 0 8px 0; font-size:12.5px; line-height:1.55; color:#787f87;">
                  Sent on behalf of ${escapeHtml(requesterName)}. Beleg helps people keep a verifiable
                  record of what they actually did.
                </p>
                <p style="margin:0; font-size:12.5px; line-height:1.55; color:#787f87;">
                  If the button doesn't work, paste this into your browser:<br />
                  <a href="${escapeHtml(confirmUrl)}" style="color:#0e9f6e; word-break:break-all;">${escapeHtml(confirmUrl)}</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html, text };
}
