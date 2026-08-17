import { mapEntry, mapVenture } from "@/lib/row";
import sql from "@/lib/supabase";
import type { Entry, Venture } from "@/lib/types";

// PUBLIC, read-only. Returns exactly the data the proof page at /p/[slug]
// already renders, so this exposes nothing new. It just makes the same record
// machine-readable for independent verifiers.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

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

  const entryRows = await sql`
    SELECT
      id, venture_id, seq, kind, title, body, occurred_at, recorded_at,
      content_hash, prev_hash, chain_hash, source, dkim_verified
    FROM entries
    WHERE venture_id = ${venture.id}
    ORDER BY seq ASC
  `;

  return Response.json(
    {
      venture: {
        name: venture.name,
        slug: venture.slug,
        tagline: venture.tagline,
      },
      entries: entryRows.map((row) =>
        mapEntry(row as Record<string, unknown>),
      ) as Entry[],
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=0, s-maxage=30",
      },
    },
  );
}
