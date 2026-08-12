import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { mapAnchor } from "@/lib/row";
import { stampHashHex } from "@/lib/ots";
import sql from "@/lib/supabase";

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

  // Verify the venture exists and belongs to the authenticated user.
  const ventureRows = await sql`
    SELECT id, clerk_user_id FROM ventures
    WHERE id = ${ventureId}
    LIMIT 1
  `;
  const venture = ventureRows[0] as
    | { id: string; clerk_user_id: string }
    | undefined;

  if (!venture || venture.clerk_user_id !== userId) {
    return NextResponse.json({ error: "Venture not found" }, { status: 404 });
  }

  // Read the chain tip: highest seq entry and its chain_hash.
  const tipRows = await sql`
    SELECT seq, chain_hash FROM entries
    WHERE venture_id = ${ventureId}
    ORDER BY seq DESC LIMIT 1
  `;
  const tip = tipRows[0] as { seq: number; chain_hash: string } | undefined;

  if (!tip) {
    return NextResponse.json(
      { error: "This ledger has no entries to anchor yet." },
      { status: 400 },
    );
  }

  const anchoredSeq = Number(tip.seq);
  const chainTipHash = String(tip.chain_hash);

  // No duplicate anchors: if the current tip (same seq and hash) is already
  // anchored, refuse. Anchoring the same fingerprint again buys nothing.
  const existingRows = await sql`
    SELECT id FROM anchors
    WHERE venture_id = ${ventureId}
      AND anchored_seq = ${anchoredSeq}
      AND chain_tip_hash = ${chainTipHash}
    LIMIT 1
  `;
  if (existingRows[0]) {
    return NextResponse.json(
      {
        error:
          "Your latest entry is already anchored. Add a new entry before anchoring again.",
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

  try {
    const rows = await sql`
      INSERT INTO anchors (
        venture_id, anchored_seq, chain_tip_hash, ots_proof, status
      )
      VALUES (
        ${ventureId}, ${anchoredSeq}, ${chainTipHash}, ${otsProof}, 'pending'
      )
      RETURNING
        id, venture_id, anchored_seq, chain_tip_hash, status,
        created_at, upgraded_at, bitcoin_block_height
    `;

    // Also mirror the .ots onto the venture so browser verification can load
    // a single field without joining anchors.
    try {
      await sql`
        UPDATE ventures
        SET ots_file_base64 = ${otsProof}
        WHERE id = ${ventureId}
      `;
    } catch (mirrorErr) {
      console.error("Failed to mirror ots_file_base64 onto venture:", mirrorErr);
    }

    return NextResponse.json(
      { anchor: mapAnchor(rows[0] as Record<string, unknown>) },
      { status: 201 },
    );
  } catch (e) {
    console.error("Anchor insert error:", e);
    return NextResponse.json(
      { error: "Failed to save anchor" },
      { status: 500 },
    );
  }
}
