import { findCityBySlug } from "@/lib/civic-cities";
import { civicJson, civicOptions, civicTooMany } from "@/lib/civic-api";
import { clientIp, rateLimitOk } from "@/lib/rateLimit";
import { parseStoredDiff } from "@/lib/civic-diff";
import { asTimestamp } from "@/lib/row";
import sql from "@/lib/supabase";

export async function OPTIONS() {
  return civicOptions();
}

export async function GET(req: Request) {
  if (!(await rateLimitOk(`civic-api:${clientIp(req)}`, 60, 60 * 60 * 1000))) {
    return civicTooMany();
  }

  const url = new URL(req.url);
  const slug = url.searchParams.get("city")?.trim() ?? "";
  const seed = findCityBySlug(slug);
  if (!seed) {
    return civicJson({ error: "Unknown city" }, 400);
  }

  const limitRaw = Number(url.searchParams.get("limit") ?? 50);
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(Math.floor(limitRaw), 1), 200)
    : 50;

  const rows = await sql`
    SELECT
      id, city, state, dataset_name, resource_url, old_hash, new_hash,
      detected_at, change_type, content_diff, story
    FROM civic_changes
    WHERE city = ${seed.city}
    ORDER BY detected_at DESC
    LIMIT ${limit}
  `;

  return civicJson(
    [...rows].map((raw) => {
      const row = raw as Record<string, unknown>;
      const content_diff = parseStoredDiff(row.content_diff);
      return {
        id: String(row.id),
        city: String(row.city ?? seed.city),
        state: String(row.state ?? seed.state),
        dataset_name: String(row.dataset_name),
        url: String(row.resource_url),
        old_hash: String(row.old_hash),
        new_hash: String(row.new_hash),
        detected_at: asTimestamp(row.detected_at),
        change_type: String(row.change_type ?? "content_modified"),
        summary: content_diff?.notable_changes[0] ?? null,
        story: row.story == null ? null : String(row.story),
        content_diff,
      };
    }),
  );
}
