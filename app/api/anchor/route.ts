import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { createSupabaseServiceRoleClient } from "@/lib/supabase";
import { stampHashHex } from "@/lib/ots";

// OpenTimestamps uses Node-only crypto/networking libraries (bitcore-lib,
// request), so this route must run on the Node.js runtime, never the Edge.
export const runtime = "nodejs";

type Body = Record<string, unknown>;

function asTrimmedString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

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
    return NextResponse.json({ error: "Venture not found" }, { status: 404 });
  }

  // Read the chain tip: highest seq entry and its chain_hash.
  const { data: tip, error: tipError } = await supabase
    .from("entries")
    .select("seq, chain_hash")
    .eq("venture_id", ventureId)
    .order("seq", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (tipError) {
    console.error("Chain tip lookup error:", tipError);
    return NextResponse.json(
      { error: "Failed to load chain tip" },
      { status: 500 },
    );
  }
  if (!tip) {
    return NextResponse.json(
      { error: "This ledger has no entries to anchor yet." },
      { status: 400 },
    );
  }

  const anchoredSeq = tip.seq as number;
  const chainTipHash = tip.chain_hash as string;

  // No duplicate anchors: if the current tip (same seq and hash) is already
  // anchored, refuse. Anchoring the same fingerprint again buys nothing.
  const { data: existing, error: existingError } = await supabase
    .from("anchors")
    .select("id")
    .eq("venture_id", ventureId)
    .eq("anchored_seq", anchoredSeq)
    .eq("chain_tip_hash", chainTipHash)
    .limit(1)
    .maybeSingle();

  if (existingError) {
    console.error("Existing anchor lookup error:", existingError);
    return NextResponse.json(
      { error: "Failed to check existing anchors" },
      { status: 500 },
    );
  }
  if (existing) {
    return NextResponse.json(
      {
        error:
          "The current chain tip is already anchored. Add a new entry before anchoring again.",
      },
      { status: 409 },
    );
  }

  // Submit the tip hash to the public OpenTimestamps calendars.
  let otsProof: string;
  try {
    otsProof = await stampHashHex(chainTipHash);
  } catch (e) {
    console.error("OTS stamp error:", e);
    return NextResponse.json(
      { error: "Failed to submit to OpenTimestamps calendars" },
      { status: 502 },
    );
  }

  const { data: anchor, error: insertError } = await supabase
    .from("anchors")
    .insert({
      venture_id: ventureId,
      anchored_seq: anchoredSeq,
      chain_tip_hash: chainTipHash,
      ots_proof: otsProof,
      status: "pending",
    })
    .select(
      "id, venture_id, anchored_seq, chain_tip_hash, status, created_at, upgraded_at, bitcoin_block_height",
    )
    .single();

  if (insertError || !anchor) {
    console.error("Anchor insert error:", insertError);
    return NextResponse.json(
      { error: "Failed to save anchor" },
      { status: 500 },
    );
  }

  return NextResponse.json({ anchor }, { status: 201 });
}
