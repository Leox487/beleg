import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { appendEntry } from "@/lib/chain";
import { rateLimitOk, tooManyRequests } from "@/lib/rateLimit";
import { sanitizeText } from "@/lib/sanitize";
import sql from "@/lib/supabase";

type Body = Record<string, unknown>;

// 'attestation' and 'email' are system-only, accepted here so sealed
// confirmations / inbound mail validate, but NOT offered in NewEntryForm.
const ALLOWED_KINDS = new Set([
  "milestone",
  "revenue",
  "partnership",
  "launch",
  "hire",
  "fundraise",
  "product",
  "legal",
  "attestation",
  "email",
  "other",
]);

function asTrimmedString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

// Append-only: this route only ever INSERTs (via appendEntry). There is
// deliberately no PATCH, PUT, or DELETE handler here or anywhere else. The
// immutable chain is the product.
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await rateLimitOk(`entries-post:${userId}`, 60, 60 * 60 * 1000))) {
    return tooManyRequests(3600);
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

  const title = sanitizeText(asTrimmedString(body.title));
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const bodyText = sanitizeText(asTrimmedString(body.body));
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

  const ventures = await sql`
    SELECT id FROM ventures
    WHERE id = ${ventureId} AND clerk_user_id = ${userId}
    LIMIT 1
  `;
  if (!ventures[0]) {
    return NextResponse.json({ error: "Venture not found" }, { status: 404 });
  }

  try {
    const entry = await appendEntry({
      venture_id: ventureId,
      kind,
      title,
      body: entryBody,
      occurred_at: occurredAt,
    });
    return NextResponse.json({ entry }, { status: 201 });
  } catch (e) {
    console.error("Entry append error:", e);
    return NextResponse.json(
      { error: "Failed to append entry" },
      { status: 500 },
    );
  }
}
