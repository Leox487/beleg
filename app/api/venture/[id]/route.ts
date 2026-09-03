import { NextResponse } from "next/server";

import { clientIp, rateLimitOk, tooManyRequests } from "@/lib/rateLimit";
import sql from "@/lib/supabase";

/**
 * Public: returns the data a browser needs to verify a Bitcoin anchor:
 * the stored .ots proof and the chain tip hash that was stamped.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Unauthenticated and runs three queries per call.
  if (!(await rateLimitOk(`venture-anchor:${clientIp(req)}`, 60, 60 * 1000))) {
    return tooManyRequests(60);
  }

  const { id } = await params;

  const ventureRows = await sql`
    SELECT id, name, slug, ots_file_base64
    FROM ventures
    WHERE id = ${id}
    LIMIT 1
  `;
  const venture = ventureRows[0] as
    | {
        id: string;
        name: string;
        slug: string;
        ots_file_base64: string | null;
      }
    | undefined;

  if (!venture) {
    return NextResponse.json({ error: "Venture not found" }, { status: 404 });
  }

  // Prefer the confirmed tip hash that matches the stored proof; fall back to
  // the latest entry's chain_hash.
  const confirmedRows = await sql`
    SELECT chain_tip_hash, ots_proof, bitcoin_block_height, status
    FROM anchors
    WHERE venture_id = ${id} AND status = 'confirmed'
    ORDER BY anchored_seq DESC
    LIMIT 1
  `;
  const confirmed = confirmedRows[0] as
    | {
        chain_tip_hash: string;
        ots_proof: string;
        bitcoin_block_height: number | null;
        status: string;
      }
    | undefined;

  const tipRows = await sql`
    SELECT chain_hash FROM entries
    WHERE venture_id = ${id}
    ORDER BY seq DESC LIMIT 1
  `;
  const tip = tipRows[0] as { chain_hash: string } | undefined;

  const ots_file_base64 =
    venture.ots_file_base64 ?? confirmed?.ots_proof ?? null;
  const latest_hash = confirmed?.chain_tip_hash ?? tip?.chain_hash ?? null;

  return NextResponse.json({
    id: venture.id,
    name: venture.name,
    slug: venture.slug,
    ots_file_base64,
    latest_hash,
    bitcoin_block_height: confirmed?.bitcoin_block_height ?? null,
    anchor_status: confirmed?.status ?? null,
  });
}
