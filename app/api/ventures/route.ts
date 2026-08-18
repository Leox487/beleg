import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { ingestAddressForSlug } from "@/lib/ingestEmail";
import { rateLimitOk, tooManyRequests } from "@/lib/rateLimit";
import { mapVenture } from "@/lib/row";
import { sanitizeText } from "@/lib/sanitize";
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

async function createInboundEndpoint(ventureId: string, slug: string) {
  const email_address = ingestAddressForSlug(slug);
  const rows = await sql`
    INSERT INTO inbound_endpoints (venture_id, email_address)
    VALUES (${ventureId}, ${email_address})
    ON CONFLICT (email_address) DO UPDATE
      SET venture_id = EXCLUDED.venture_id, is_active = true
    RETURNING id, venture_id, email_address, is_active, created_at, last_ingested_at
  `;
  return rows[0];
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!rateLimitOk(`ventures-post:${userId}`, 10, 60 * 60 * 1000)) {
    return tooManyRequests(3600);
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name =
    typeof body.name === "string" ? sanitizeText(body.name) : "";
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (name.length > 80) {
    return NextResponse.json(
      { error: "Name must be 80 characters or fewer" },
      { status: 400 },
    );
  }

  const taglineRaw =
    typeof body.tagline === "string" ? sanitizeText(body.tagline) : "";
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
      const venture = mapVenture(rows[0] as Record<string, unknown>);

      let inbound = null;
      try {
        inbound = await createInboundEndpoint(venture.id, venture.slug);
      } catch (e) {
        console.error("Inbound endpoint create error:", e);
      }

      return NextResponse.json(
        {
          venture,
          inbound_endpoint: inbound
            ? {
                id: String(inbound.id),
                venture_id: String(inbound.venture_id),
                email_address: String(inbound.email_address),
                is_active: Boolean(inbound.is_active),
                created_at:
                  inbound.created_at instanceof Date
                    ? inbound.created_at.toISOString()
                    : String(inbound.created_at),
                last_ingested_at: inbound.last_ingested_at
                  ? inbound.last_ingested_at instanceof Date
                    ? inbound.last_ingested_at.toISOString()
                    : String(inbound.last_ingested_at)
                  : null,
              }
            : null,
        },
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
