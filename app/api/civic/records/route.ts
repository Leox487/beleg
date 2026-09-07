import { findCityBySlug } from "@/lib/civic-cities";
import { civicJson, civicOptions, civicTooMany } from "@/lib/civic-api";
import { clientIp, rateLimitOk } from "@/lib/rateLimit";
import { asNullableString, asTimestamp } from "@/lib/row";
import sql from "@/lib/supabase";

export async function OPTIONS() {
  return civicOptions();
}

export async function GET(req: Request) {
  if (!(await rateLimitOk(`civic-api:${clientIp(req)}`, 60, 60 * 60 * 1000))) {
    return civicTooMany();
  }

  const slug = new URL(req.url).searchParams.get("city")?.trim() ?? "";
  const seed = findCityBySlug(slug);
  if (!seed) {
    return civicJson({ error: "Unknown city" }, 400);
  }

  const rows = await sql`
    SELECT DISTINCT ON (resource_url)
      id, city, state, dataset_name, resource_url, file_hash, retrieved_at,
      anchor_status, bitcoin_block_height
    FROM civic_records
    WHERE city = ${seed.city}
    ORDER BY resource_url, retrieved_at DESC
  `;

  return civicJson(
    [...rows].map((raw) => {
      const row = raw as Record<string, unknown>;
      return {
        id: String(row.id),
        city: String(row.city),
        state: String(row.state),
        dataset_name: String(row.dataset_name),
        url: String(row.resource_url),
        hash: String(row.file_hash),
        checked: asTimestamp(row.retrieved_at),
        anchor_status: asNullableString(row.anchor_status),
        bitcoin_block_height:
          row.bitcoin_block_height == null
            ? null
            : Number(row.bitcoin_block_height),
      };
    }),
  );
}
