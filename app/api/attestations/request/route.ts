import { randomUUID } from "crypto";

import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { sendAttestationEmail } from "@/lib/email";
import { rateLimitOk, tooManyRequests } from "@/lib/rateLimit";
import { sanitizeText } from "@/lib/sanitize";
import sql from "@/lib/supabase";

type Body = Record<string, unknown>;

// Plausible-email check: not a full RFC validator, just a sanity gate.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asTrimmedString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function makeToken(): string {
  // Two UUIDv4s concatenated, hyphens stripped → 64 URL-safe hex chars.
  return (randomUUID() + randomUUID()).replace(/-/g, "");
}

function resolveSiteUrl(req: Request): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const origin = req.headers.get("origin");
  if (origin) return origin.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return new URL(req.url).origin;
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Each success sends a Resend email. Signup is open, so cap this per account
  // to protect both the bill and the sending domain's reputation.
  if (!(await rateLimitOk(`attest-request:${userId}`, 50, 24 * 60 * 60 * 1000))) {
    return tooManyRequests(3600);
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const entryId = asTrimmedString(body.entry_id);
  if (!entryId) {
    return NextResponse.json({ error: "entry_id is required" }, { status: 400 });
  }

  const attesterEmail = asTrimmedString(body.attester_email).toLowerCase();
  if (!EMAIL_RE.test(attesterEmail)) {
    return NextResponse.json(
      { error: "A valid attester email is required" },
      { status: 400 },
    );
  }

  const attesterNameRaw = sanitizeText(asTrimmedString(body.attester_name));
  const attesterName = attesterNameRaw.length > 0 ? attesterNameRaw : null;

  const statement = sanitizeText(asTrimmedString(body.statement));
  if (!statement) {
    return NextResponse.json(
      { error: "A statement is required" },
      { status: 400 },
    );
  }
  if (statement.length > 280) {
    return NextResponse.json(
      { error: "Statement must be 280 characters or fewer" },
      { status: 400 },
    );
  }

  const owned = await sql`
    SELECT e.id, e.venture_id, e.title, v.id AS venture_pk, v.name
    FROM entries e
    INNER JOIN ventures v ON v.id = e.venture_id
    WHERE e.id = ${entryId} AND v.clerk_user_id = ${userId}
    LIMIT 1
  `;
  const row = owned[0] as
    | { id: string; venture_id: string; title: string; name: string }
    | undefined;

  if (!row) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  const entry = { id: row.id, venture_id: row.venture_id, title: row.title };
  const venture = { id: row.venture_id, name: row.name };

  const token = makeToken();

  let inserted: { token: string };
  try {
    const rows = await sql`
      INSERT INTO attestations (
        venture_id, entry_id, attester_email, attester_name, statement, token, status
      )
      VALUES (
        ${venture.id}, ${entry.id}, ${attesterEmail}, ${attesterName},
        ${statement}, ${token}, 'pending'
      )
      RETURNING token
    `;
    inserted = rows[0] as { token: string };
  } catch (e) {
    console.error("Attestation insert error:", e);
    return NextResponse.json(
      { error: "Failed to create attestation request" },
      { status: 500 },
    );
  }

  const siteUrl = resolveSiteUrl(req);
  const attestUrl = `${siteUrl}/attest/${inserted.token}`;
  const relativeUrl = `/attest/${inserted.token}`;

  const requester = await currentUser();
  const founderName =
    [requester?.firstName, requester?.lastName].filter(Boolean).join(" ") ||
    requester?.username ||
    venture.name;

  let emailSent = false;
  try {
    await sendAttestationEmail({
      to: attesterEmail,
      attesterName: attesterName ?? "",
      founderName,
      ventureName: venture.name,
      entryTitle: entry.title,
      statement,
      attestUrl,
    });
    emailSent = true;
  } catch (err) {
    // Attestation already exists; founder can still copy the link.
    console.error("Attestation email failed:", err);
  }

  return NextResponse.json(
    {
      token: inserted.token,
      url: relativeUrl,
      confirm_url: attestUrl,
      emailSent,
    },
    { status: 201 },
  );
}
