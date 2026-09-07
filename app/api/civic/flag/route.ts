import { citySlug } from "@/lib/civic-cities";
import { civicJson, civicOptions, civicTooMany } from "@/lib/civic-api";
import { sendCivicFlagEmail } from "@/lib/civic-email";
import { clientIp, rateLimitOk } from "@/lib/rateLimit";
import { sanitizeText } from "@/lib/sanitize";
import { SITE_URL } from "@/lib/site";
import sql from "@/lib/supabase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function OPTIONS() {
  return civicOptions();
}

export async function POST(req: Request) {
  if (!(await rateLimitOk(`civic-flag:${clientIp(req)}`, 10, 60 * 60 * 1000))) {
    return civicTooMany();
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return civicJson({ error: "Invalid JSON" }, 400);
  }

  const changeId = typeof body.change_id === "string" ? body.change_id.trim() : "";
  const reporterName = sanitizeText(
    typeof body.reporter_name === "string" ? body.reporter_name.trim() : "",
  );
  const reporterEmail =
    typeof body.reporter_email === "string"
      ? body.reporter_email.trim().toLowerCase()
      : "";
  const note = sanitizeText(typeof body.note === "string" ? body.note.trim() : "");
  const cityHint = typeof body.city === "string" ? body.city.trim() : "";

  if (!changeId || !reporterName || !EMAIL_RE.test(reporterEmail) || !note) {
    return civicJson({ error: "Name, email, note, and change are required" }, 400);
  }

  const changeRows = await sql`
    SELECT id, city, dataset_name, resource_url
    FROM civic_changes
    WHERE id = ${changeId}
    LIMIT 1
  `;
  const change = changeRows[0] as Record<string, unknown> | undefined;
  if (!change) {
    return civicJson({ error: "Change not found" }, 404);
  }

  await sql`
    INSERT INTO civic_flags (change_id, reporter_name, reporter_email, note)
    VALUES (${changeId}, ${reporterName}, ${reporterEmail}, ${note})
  `;

  const city = String(change.city ?? cityHint);
  try {
    await sendCivicFlagEmail({
      city,
      datasetName: String(change.dataset_name ?? ""),
      resourceUrl: String(change.resource_url ?? ""),
      reporterName,
      reporterEmail,
      note,
      auditUrl: `${SITE_URL}/audit/${citySlug(city || "pittsburgh")}`,
    });
  } catch (error) {
    console.error("Civic flag email failed:", error);
  }

  return civicJson({ ok: true });
}
