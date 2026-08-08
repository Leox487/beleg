import { createSupabaseServiceRoleClient } from "@/lib/supabase";
import type { Entry, Venture } from "@/lib/types";

// PUBLIC, read-only. Returns exactly the data the proof page at /p/[slug]
// already renders, so this exposes nothing new — it just makes the same record
// machine-readable for independent verifiers.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const supabase = createSupabaseServiceRoleClient();

  const { data: ventureData, error: ventureError } = await supabase
    .from("ventures")
    .select("id, name, slug, tagline, created_at")
    .eq("slug", slug)
    .maybeSingle();

  if (ventureError) {
    console.error("Public venture lookup error:", ventureError);
    return Response.json({ error: "Failed to load ledger" }, { status: 500 });
  }

  const venture = ventureData as Pick<
    Venture,
    "id" | "name" | "slug" | "tagline" | "created_at"
  > | null;

  if (!venture) {
    return Response.json({ error: "Ledger not found" }, { status: 404 });
  }

  const { data: entriesData, error: entriesError } = await supabase
    .from("entries")
    .select(
      "id, venture_id, seq, kind, title, body, occurred_at, recorded_at, content_hash, prev_hash, chain_hash",
    )
    .eq("venture_id", venture.id)
    .order("seq", { ascending: true });

  if (entriesError) {
    console.error("Public entries lookup error:", entriesError);
    return Response.json({ error: "Failed to load entries" }, { status: 500 });
  }

  return Response.json(
    {
      venture: {
        name: venture.name,
        slug: venture.slug,
        tagline: venture.tagline,
      },
      entries: (entriesData ?? []) as Entry[],
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=0, s-maxage=30",
      },
    },
  );
}
