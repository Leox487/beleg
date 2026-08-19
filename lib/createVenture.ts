import "server-only";

import { ingestAddressForSlug } from "@/lib/ingestEmail";
import { mapVenture } from "@/lib/row";
import { sanitizeText } from "@/lib/sanitize";
import sql from "@/lib/supabase";
import type { Venture } from "@/lib/types";

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
  await sql`
    INSERT INTO inbound_endpoints (venture_id, email_address)
    VALUES (${ventureId}, ${email_address})
    ON CONFLICT (email_address) DO UPDATE
      SET venture_id = EXCLUDED.venture_id, is_active = true
  `;
}

export async function createVentureForUser(
  userId: string,
  rawName: string,
  rawTagline: string,
): Promise<Venture> {
  const name = sanitizeText(rawName);
  if (!name) {
    throw new Error("Name is required");
  }
  if (name.length > 80) {
    throw new Error("Name must be 80 characters or fewer");
  }

  const taglineRaw = sanitizeText(rawTagline);
  const tagline = taglineRaw.length > 0 ? taglineRaw : null;

  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = slugify(name);
    try {
      const rows = await sql`
        INSERT INTO ventures (clerk_user_id, name, slug, tagline)
        VALUES (${userId}, ${name}, ${slug}, ${tagline})
        RETURNING id, clerk_user_id, name, slug, tagline, created_at
      `;
      const venture = mapVenture(rows[0] as Record<string, unknown>);
      try {
        await createInboundEndpoint(venture.id, venture.slug);
      } catch (e) {
        console.error("Inbound endpoint create error:", e);
      }
      return venture;
    } catch (e: unknown) {
      const code =
        typeof e === "object" && e && "code" in e
          ? String((e as { code: unknown }).code)
          : "";
      if (code === "23505") continue;
      throw e;
    }
  }

  throw new Error("Could not generate a unique slug, please try again");
}
