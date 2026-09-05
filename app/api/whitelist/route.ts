import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { sanitizeText } from "@/lib/sanitize";
import sql from "@/lib/supabase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function ownedVenture(ventureId: string, userId: string) {
  const rows = await sql`
    SELECT id FROM ventures
    WHERE id = ${ventureId} AND clerk_user_id = ${userId}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ventureId = new URL(req.url).searchParams.get("ventureId")?.trim();
  if (!ventureId) {
    return NextResponse.json(
      { error: "ventureId is required" },
      { status: 400 },
    );
  }

  if (!(await ownedVenture(ventureId, userId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const rows = await sql`
    SELECT id, sender_email
    FROM email_whitelist
    WHERE venture_id = ${ventureId}
    ORDER BY created_at ASC
  `;

  return NextResponse.json({
    emails: rows.map((r) => ({
      id: String(r.id),
      sender_email: String(r.sender_email),
    })),
  });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const ventureId =
    typeof body.ventureId === "string" ? body.ventureId.trim() : "";
  const senderEmail =
    typeof body.senderEmail === "string"
      ? sanitizeText(body.senderEmail).toLowerCase()
      : "";

  if (!ventureId) {
    return NextResponse.json(
      { error: "ventureId is required" },
      { status: 400 },
    );
  }
  if (!EMAIL_RE.test(senderEmail)) {
    return NextResponse.json(
      { error: "Invalid email address" },
      { status: 400 },
    );
  }

  if (!(await ownedVenture(ventureId, userId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const rows = await sql`
      INSERT INTO email_whitelist (venture_id, sender_email)
      VALUES (${ventureId}, ${senderEmail})
      RETURNING id, sender_email
    `;
    return NextResponse.json(
      {
        id: String(rows[0].id),
        sender_email: String(rows[0].sender_email),
      },
      { status: 201 },
    );
  } catch (e: unknown) {
    const code =
      typeof e === "object" && e && "code" in e
        ? String((e as { code: unknown }).code)
        : "";
    if (code === "23505") {
      return NextResponse.json(
        { error: "Already whitelisted" },
        { status: 409 },
      );
    }
    throw e;
  }
}
