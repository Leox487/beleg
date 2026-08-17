import { NextResponse } from "next/server";

import { verifyBitcoinAnchor } from "@/lib/verifyTimestamps";

export const runtime = "nodejs";

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
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const ots = typeof body.ots_file_base64 === "string" ? body.ots_file_base64 : "";
  const hash = typeof body.ledger_hash === "string" ? body.ledger_hash.trim() : "";
  if (!ots || !hash) {
    return NextResponse.json(
      { error: "ots_file_base64 and ledger_hash are required" },
      { status: 400 },
    );
  }

  const result = await verifyBitcoinAnchor(ots, hash);
  return NextResponse.json(result);
}
