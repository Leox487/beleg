import { clientIp, rateLimitOk, tooManyRequests } from "@/lib/rateLimit";
import { mapEntry, mapVenture } from "@/lib/row";
import sql from "@/lib/supabase";
import type { Entry, Venture } from "@/lib/types";

// PUBLIC, read-only. Returns exactly the data the proof page at /p/[slug]
// already renders, so this exposes nothing new. It just makes the same record
// machine-readable for independent verifiers.
//
// Paged by `seq` so one request cannot pull an unbounded number of rows.
// Verifiers need the whole chain, so follow `next_after_seq` until
// `has_more` is false; entries come back in `seq` order across pages.
const DEFAULT_LIMIT = 500;
const MAX_LIMIT = 1000;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await rateLimitOk(`public-entries:${clientIp(req)}`, 60, 60 * 1000))) {
    return tooManyRequests(60);
  }

  const { slug } = await params;
  const url = new URL(req.url);

  const limitRaw = Number(url.searchParams.get("limit"));
  const limit =
    Number.isInteger(limitRaw) && limitRaw > 0
      ? Math.min(limitRaw, MAX_LIMIT)
      : DEFAULT_LIMIT;

  const afterRaw = Number(url.searchParams.get("after_seq"));
  const afterSeq = Number.isInteger(afterRaw) && afterRaw > 0 ? afterRaw : 0;

  const ventureRows = await sql`
    SELECT id, clerk_user_id, name, slug, tagline, created_at
    FROM ventures
    WHERE slug = ${slug}
    LIMIT 1
  `;

  if (!ventureRows[0]) {
    return Response.json({ error: "Ledger not found" }, { status: 404 });
  }

  const venture = mapVenture(ventureRows[0] as Record<string, unknown>) as Pick<
    Venture,
    "id" | "name" | "slug" | "tagline" | "created_at"
  > &
    Venture;

  // Fetch one extra row to detect whether another page exists.
  const entryRows = await sql`
    SELECT
      id, venture_id, seq, kind, title, body, occurred_at, recorded_at,
      content_hash, prev_hash, chain_hash, source, dkim_verified
    FROM entries
    WHERE venture_id = ${venture.id} AND seq > ${afterSeq}
    ORDER BY seq ASC
    LIMIT ${limit + 1}
  `;

  const hasMore = entryRows.length > limit;
  const page = hasMore ? entryRows.slice(0, limit) : entryRows;
  const entries = page.map((row) =>
    mapEntry(row as Record<string, unknown>),
  ) as Entry[];

  return Response.json(
    {
      venture: {
        name: venture.name,
        slug: venture.slug,
        tagline: venture.tagline,
      },
      entries,
      has_more: hasMore,
      next_after_seq: hasMore ? Number(entries[entries.length - 1].seq) : null,
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=0, s-maxage=30",
      },
    },
  );
}
