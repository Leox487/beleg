import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { mapVenture } from "@/lib/row";
import sql from "@/lib/supabase";

type Body = Record<string, unknown>;

const SUFFIX_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
const INBOUND_DOMAIN = "ingest.belegapp.com";

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

/** Local-part stem from venture name (no random suffix — id slice provides uniqueness). */
function slugifyName(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || "venture";
}

function inboundEmailAddress(name: string, ventureId: string, salt = ""): string {
  const local = `${slugifyName(name)}-${ventureId.slice(0, 8)}${salt}`;
  return `${local}@${INBOUND_DOMAIN}`;
}

async function createInboundEndpoint(ventureId: string, name: string) {
  // email_address is UNIQUE; collide only if the same id prefix somehow retries.
  for (let attempt = 0; attempt < 5; attempt++) {
    const salt = attempt === 0 ? "" : `-${randomSuffix(3)}`;
    const email_address = inboundEmailAddress(name, ventureId, salt);
    try {
      const rows = await sql`
        INSERT INTO inbound_endpoints (venture_id, email_address)
        VALUES (${ventureId}, ${email_address})
        RETURNING id, venture_id, email_address, is_active, created_at, last_ingested_at
      `;
      return rows[0];
    } catch (e: unknown) {
      const code =
        typeof e === "object" && e && "code" in e
          ? String((e as { code: unknown }).code)
          : "";
      if (code !== "23505") throw e;
    }
  }
  throw new Error("Could not allocate a unique inbound email address");
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
      const venture = mapVenture(rows[0] as Record<string, unknown>);

      let inbound = null;
      try {
        inbound = await createInboundEndpoint(venture.id, venture.name);
      } catch (e) {
        console.error("Inbound endpoint create error:", e);
        // Venture already exists; surface a soft failure so the client still
        // gets the ledger. Endpoint can be backfilled later if needed.
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
