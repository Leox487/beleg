import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { createSupabaseServiceRoleClient } from "@/lib/supabase";
import {
  GENESIS_HASH,
  chainHash,
  contentHash,
  type EntryContent,
} from "@/lib/hash";

type Body = Record<string, unknown>;

const ALLOWED_KINDS = new Set([
  "milestone",
  "revenue",
  "partnership",
  "launch",
  "hire",
  "fundraise",
  "product",
  "legal",
  "other",
]);

function asTrimmedString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

// Append-only: this route only ever INSERTs. There is deliberately no PATCH,
// PUT, or DELETE handler here or anywhere else — the immutable chain is the product.
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const ventureId = asTrimmedString(body.venture_id);
  if (!ventureId) {
    return NextResponse.json(
      { error: "venture_id is required" },
      { status: 400 },
    );
  }

  const title = asTrimmedString(body.title);
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const bodyText = asTrimmedString(body.body);
  const entryBody: string | null = bodyText.length > 0 ? bodyText : null;

  const occurredRaw = asTrimmedString(body.occurred_at);
  let occurredAt: string | null = null;
  if (occurredRaw) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(occurredRaw)) {
      return NextResponse.json(
        { error: "occurred_at must be an ISO date (YYYY-MM-DD)" },
        { status: 400 },
      );
    }
    occurredAt = occurredRaw;
  }

  const kindRaw = asTrimmedString(body.kind);
  const kind = kindRaw || "milestone";
  if (!ALLOWED_KINDS.has(kind)) {
    return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
  }

  const supabase = createSupabaseServiceRoleClient();

  // Verify the venture exists and belongs to the authenticated user.
  const { data: venture, error: ventureError } = await supabase
    .from("ventures")
    .select("id, clerk_user_id")
    .eq("id", ventureId)
    .maybeSingle();

  if (ventureError) {
    console.error("Venture lookup error:", ventureError);
    return NextResponse.json(
      { error: "Failed to load venture" },
      { status: 500 },
    );
  }
  if (!venture || venture.clerk_user_id !== userId) {
    // Do not leak existence of other users' ventures.
    return NextResponse.json({ error: "Venture not found" }, { status: 404 });
  }

  // Fetch the current chain tip: highest seq and its chain_hash.
  const { data: lastEntry, error: lastError } = await supabase
    .from("entries")
    .select("seq, chain_hash")
    .eq("venture_id", ventureId)
    .order("seq", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastError) {
    console.error("Last entry lookup error:", lastError);
    return NextResponse.json(
      { error: "Failed to load chain tip" },
      { status: 500 },
    );
  }

  const prevHash = lastEntry?.chain_hash ?? GENESIS_HASH;
  const seq = (lastEntry?.seq ?? 0) + 1;

  // recorded_at is set server-side, never trusted from the client.
  const recordedAt = new Date().toISOString();

  const content: EntryContent = {
    venture_id: ventureId,
    seq,
    kind,
    title,
    body: entryBody,
    occurred_at: occurredAt,
    recorded_at: recordedAt,
  };

  const contentHashHex = contentHash(content);
  const chainHashHex = chainHash(prevHash, contentHashHex);

  const { data: inserted, error: insertError } = await supabase
    .from("entries")
    .insert({
      venture_id: ventureId,
      seq,
      kind,
      title,
      body: entryBody,
      occurred_at: occurredAt,
      recorded_at: recordedAt,
      content_hash: contentHashHex,
      prev_hash: prevHash,
      chain_hash: chainHashHex,
    })
    .select(
      "id, venture_id, seq, kind, title, body, occurred_at, recorded_at, content_hash, prev_hash, chain_hash",
    )
    .single();

  if (insertError || !inserted) {
    // A unique violation on (venture_id, seq) means a concurrent append raced us.
    console.error("Entry insert error:", insertError);
    return NextResponse.json(
      { error: "Failed to append entry" },
      { status: 500 },
    );
  }

  return NextResponse.json({ entry: inserted }, { status: 201 });
}
