import { randomUUID } from "crypto";

import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { sendAttestationEmail } from "@/lib/email";
import { createSupabaseServiceRoleClient } from "@/lib/supabase";

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

  const attesterNameRaw = asTrimmedString(body.attester_name);
  const attesterName = attesterNameRaw.length > 0 ? attesterNameRaw : null;

  const statement = asTrimmedString(body.statement);
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

  const supabase = createSupabaseServiceRoleClient();

  const { data: entry, error: entryError } = await supabase
    .from("entries")
    .select("id, venture_id, title")
    .eq("id", entryId)
    .maybeSingle();

  if (entryError) {
    console.error("Entry lookup error:", entryError);
    return NextResponse.json(
      { error: "Failed to load entry" },
      { status: 500 },
    );
  }
  if (!entry) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  const { data: venture, error: ventureError } = await supabase
    .from("ventures")
    .select("id, clerk_user_id, name")
    .eq("id", entry.venture_id)
    .maybeSingle();

  if (ventureError) {
    console.error("Venture lookup error:", ventureError);
    return NextResponse.json(
      { error: "Failed to load venture" },
      { status: 500 },
    );
  }
  if (!venture || venture.clerk_user_id !== userId) {
    // Don't leak existence of other users' entries.
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  const token = makeToken();

  const { data: inserted, error: insertError } = await supabase
    .from("attestations")
    .insert({
      venture_id: venture.id,
      entry_id: entry.id,
      attester_email: attesterEmail,
      attester_name: attesterName,
      statement,
      token,
      status: "pending",
    })
    .select("token")
    .single();

  if (insertError || !inserted) {
    console.error("Attestation insert error:", insertError);
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
    (venture.name as string);

  let emailSent = false;
  try {
    await sendAttestationEmail({
      to: attesterEmail,
      attesterName: attesterName ?? "",
      founderName,
      ventureName: venture.name as string,
      entryTitle: entry.title as string,
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
