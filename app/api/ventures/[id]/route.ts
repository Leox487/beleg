import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { mapVenture } from "@/lib/row";
import sql from "@/lib/supabase";

async function getOwnedVenture(id: string, userId: string) {
  const rows = await sql`
    SELECT id, clerk_user_id, name, slug, tagline, created_at
    FROM ventures
    WHERE id = ${id} AND clerk_user_id = ${userId}
    LIMIT 1
  `;
  return rows[0]
    ? mapVenture(rows[0] as Record<string, unknown>)
    : null;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const venture = await getOwnedVenture(id, userId);
  if (!venture) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ venture });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const venture = await getOwnedVenture(id, userId);
  if (!venture) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if ("name" in body || "slug" in body) {
    return NextResponse.json(
      {
        error:
          "Name and URL cannot be changed — this protects existing proof page links",
      },
      { status: 400 },
    );
  }

  const keys = Object.keys(body).filter((k) => body[k] !== undefined);
  if (keys.length === 0 || keys.some((k) => k !== "tagline")) {
    return NextResponse.json(
      { error: "Only tagline can be updated" },
      { status: 400 },
    );
  }

  const taglineRaw = body.tagline;
  const tagline =
    taglineRaw == null
      ? null
      : typeof taglineRaw === "string"
        ? taglineRaw.trim() || null
        : null;

  if (tagline && tagline.length > 280) {
    return NextResponse.json(
      { error: "Tagline must be 280 characters or fewer" },
      { status: 400 },
    );
  }

  const rows = await sql`
    UPDATE ventures
    SET tagline = ${tagline}
    WHERE id = ${id} AND clerk_user_id = ${userId}
    RETURNING id, clerk_user_id, name, slug, tagline, created_at
  `;

  return NextResponse.json({
    venture: mapVenture(rows[0] as Record<string, unknown>),
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const venture = await getOwnedVenture(id, userId);
  if (!venture) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Clear inbound audit tables first (they reference entries / endpoints).
  await sql`DELETE FROM email_whitelist WHERE venture_id = ${id}`;
  await sql`
    DELETE FROM ingested_emails
    WHERE endpoint_id IN (
      SELECT id FROM inbound_endpoints WHERE venture_id = ${id}
    )
  `;
  await sql`DELETE FROM inbound_endpoints WHERE venture_id = ${id}`;
  await sql`DELETE FROM stripe_connections WHERE venture_id = ${id}`;

  // Required FK order: attestations → entries → anchors → venture.
  await sql`DELETE FROM attestations WHERE venture_id = ${id}`;
  await sql`DELETE FROM entries WHERE venture_id = ${id}`;
  await sql`DELETE FROM anchors WHERE venture_id = ${id}`;
  await sql`DELETE FROM ventures WHERE id = ${id} AND clerk_user_id = ${userId}`;

  return NextResponse.json({ deleted: true });
}
