import { civicJson, civicOptions, civicTooMany } from "@/lib/civic-api";
import { clientIp, rateLimitOk } from "@/lib/rateLimit";
import { asTimestamp } from "@/lib/row";
import sql from "@/lib/supabase";

export async function OPTIONS() {
  return civicOptions();
}

export async function GET(req: Request) {
  if (!(await rateLimitOk(`civic-api:${clientIp(req)}`, 60, 60 * 60 * 1000))) {
    return civicTooMany();
  }

  const rows = await sql`
    SELECT
      r.city,
      r.state,
      count(DISTINCT r.resource_url)::int AS record_count,
      max(r.retrieved_at) AS last_checked,
      (
        SELECT count(*)::int
        FROM civic_changes c
        WHERE c.city = r.city
      ) AS change_count
    FROM civic_records r
    GROUP BY r.city, r.state
    ORDER BY r.city
  `;

  return civicJson(
    [...rows].map((raw) => {
      const row = raw as Record<string, unknown>;
      return {
        city: String(row.city),
        state: String(row.state),
        record_count: Number(row.record_count ?? 0),
        last_checked: row.last_checked ? asTimestamp(row.last_checked) : null,
        change_count: Number(row.change_count ?? 0),
      };
    }),
  );
}
