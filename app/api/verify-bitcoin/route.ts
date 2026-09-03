import { NextResponse } from "next/server";

import { clientIp, rateLimitOk, tooManyRequests } from "@/lib/rateLimit";
import { verifyBitcoinAnchor } from "@/lib/verifyTimestamps";

export const runtime = "nodejs";

// Verification is CPU-bound and makes an outbound call, so cap how long one
// request can hold a function open.
export const maxDuration = 20;

// A real .ots proof is a few KB; 100k base64 chars (~75 KB) is generous.
// Without this the route will happily decode and parse whatever it is sent.
const MAX_OTS_BASE64 = 100_000;

const SHA256_HEX = /^[0-9a-f]{64}$/;

type Body = {
  ots_file_base64?: string;
  ledger_hash?: string;
};

/**
 * Runs OpenTimestamps Bitcoin verification. Invoked from the browser proof
 * page after the client has fetched ots_file_base64 + latest_hash. The
 * opentimestamps package is Node-only (bitcore/request), so the heavy lift
 * happens here while chain hashing stays in the browser.
 */
export async function POST(req: Request) {
  // Unauthenticated and expensive: one call costs OpenTimestamps parsing plus
  // an outbound block-header fetch, so meter it before doing any of that.
  if (!(await rateLimitOk(`verify-bitcoin:${clientIp(req)}`, 20, 60 * 1000))) {
    return tooManyRequests(60);
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const ots = typeof body.ots_file_base64 === "string" ? body.ots_file_base64 : "";
  const hash =
    typeof body.ledger_hash === "string" ? body.ledger_hash.trim().toLowerCase() : "";
  if (!ots || !hash) {
    return NextResponse.json(
      { error: "ots_file_base64 and ledger_hash are required" },
      { status: 400 },
    );
  }

  if (ots.length > MAX_OTS_BASE64) {
    return NextResponse.json(
      { error: "ots_file_base64 is too large" },
      { status: 413 },
    );
  }

  if (!SHA256_HEX.test(hash.replace(/^0x/, ""))) {
    return NextResponse.json(
      { error: "ledger_hash must be a 64-character SHA-256 hex digest" },
      { status: 400 },
    );
  }

  const result = await verifyBitcoinAnchor(ots, hash);
  return NextResponse.json(result);
}
