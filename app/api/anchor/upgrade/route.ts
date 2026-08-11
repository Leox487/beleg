import { NextResponse } from "next/server";

import { mapAnchor } from "@/lib/row";
import { upgradeProofBase64 } from "@/lib/ots";
import sql from "@/lib/supabase";
import type { Anchor } from "@/lib/types";

// OpenTimestamps is Node-only. This route is not user-facing; it is triggered
// by a scheduled cron (see vercel.json) and guarded by CRON_SECRET.
export const runtime = "nodejs";

// Bitcoin confirmations take at least an hour in practice; there is no point
// hammering the calendars for anchors younger than this.
const MIN_AGE_MS = 60 * 60 * 1000;

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // Fail closed: without a configured secret the route is disabled.
    return false;
  }
  const header = req.headers.get("authorization");
  // Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`.
  return header === `Bearer ${secret}`;
}

async function handleUpgrade(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - MIN_AGE_MS).toISOString();

  const pendingRows = await sql`
    SELECT
      id, venture_id, anchored_seq, chain_tip_hash, ots_proof, status,
      created_at, upgraded_at, bitcoin_block_height
    FROM anchors
    WHERE status = 'pending' AND created_at < ${cutoff}
  `;

  const anchors = pendingRows.map((row) =>
    mapAnchor(row as Record<string, unknown>),
  ) as Anchor[];
  let confirmed = 0;
  let updated = 0;

  for (const anchor of anchors) {
    try {
      const result = await upgradeProofBase64(anchor.ots_proof);

      if (result.confirmed) {
        try {
          await sql`
            UPDATE anchors
            SET
              status = 'confirmed',
              upgraded_at = ${new Date().toISOString()},
              bitcoin_block_height = ${result.bitcoinBlockHeight},
              ots_proof = ${result.proofBase64}
            WHERE id = ${anchor.id}
          `;
          confirmed++;
        } catch (error) {
          console.error(`Failed to confirm anchor ${anchor.id}:`, error);
        }
      } else if (result.changed) {
        // Proof gained intermediate attestations but no Bitcoin block yet.
        // Persist the richer proof so the next upgrade has less work to do.
        try {
          await sql`
            UPDATE anchors
            SET ots_proof = ${result.proofBase64}
            WHERE id = ${anchor.id}
          `;
          updated++;
        } catch (error) {
          console.error(`Failed to update anchor ${anchor.id}:`, error);
        }
      }
    } catch (e) {
      console.error(`Upgrade failed for anchor ${anchor.id}:`, e);
    }
  }

  return NextResponse.json({
    checked: anchors.length,
    confirmed,
    updated,
  });
}

// Vercel Cron invokes the route with a GET (and an Authorization: Bearer
// $CRON_SECRET header). POST is exposed for manual/programmatic triggering.
export async function GET(req: Request) {
  return handleUpgrade(req);
}

export async function POST(req: Request) {
  return handleUpgrade(req);
}
