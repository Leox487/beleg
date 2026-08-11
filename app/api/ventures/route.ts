import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { mapVenture } from "@/lib/row";
import sql from "@/lib/supabase";

type Body = Record<string, unknown>;

const SUFFIX_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

function randomSuffix(len = 4): string {
  let out = "";
  for (let i = 0; i < len; i++) {
    out += SUFFIX_ALPHABET[Math.floor(Math.random() * SUFFIX_ALPHABET.length)];
  }
  return out;
}

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const stem = base || "venture";
  return `${stem}-${randomSuffix()}`;
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

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (name.length > 80) {
    return NextResponse.json(
      { error: "Name must be 80 characters or fewer" },
      { status: 400 },
    );
  }

  const taglineRaw = typeof body.tagline === "string" ? body.tagline.trim() : "";
  const tagline = taglineRaw.length > 0 ? taglineRaw : null;

  // Retry on the (unlikely) slug collision from the random suffix.
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = slugify(name);
    try {
      const rows = await sql`
        INSERT INTO ventures (clerk_user_id, name, slug, tagline)
        VALUES (${userId}, ${name}, ${slug}, ${tagline})
        RETURNING id, clerk_user_id, name, slug, tagline, created_at
      `;
      return NextResponse.json(
        { venture: mapVenture(rows[0] as Record<string, unknown>) },
        { status: 201 },
      );
    } catch (e: unknown) {
      const code =
        typeof e === "object" && e && "code" in e
          ? String((e as { code: unknown }).code)
          : "";
      // 23505 = unique_violation (slug collision); retry with a new suffix.
      if (code !== "23505") {
        console.error("Venture insert error:", e);
        return NextResponse.json(
          { error: "Failed to create venture" },
          { status: 500 },
        );
      }
    }
  }

  return NextResponse.json(
    { error: "Could not generate a unique slug, please try again" },
    { status: 500 },
  );
}
