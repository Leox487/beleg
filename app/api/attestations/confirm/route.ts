import { NextResponse } from "next/server";

import { createSupabaseServiceRoleClient } from "@/lib/supabase";

type Body = Record<string, unknown>;

function asTrimmedString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

// PUBLIC route: the unguessable token IS the authentication. No auth() here.
export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const token = asTrimmedString(body.token);
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const attesterNameRaw = asTrimmedString(body.attester_name);
  const attesterName = attesterNameRaw.length > 0 ? attesterNameRaw : null;

  const supabase = createSupabaseServiceRoleClient();

  const { data: attestation, error: lookupError } = await supabase
    .from("attestations")
    .select("id, status, confirmed_at")
    .eq("token", token)
    .maybeSingle();

  if (lookupError) {
    console.error("Attestation lookup error:", lookupError);
    return NextResponse.json(
      { error: "Failed to load attestation" },
      { status: 500 },
    );
  }
  if (!attestation) {
    return NextResponse.json(
      { error: "This confirmation link is invalid." },
      { status: 404 },
    );
  }

  // Hard replay guard: a confirmed attestation is a one-way, terminal state.
  if (attestation.status === "confirmed") {
    return NextResponse.json(
      { error: "This attestation has already been confirmed." },
      { status: 409 },
    );
  }

  // Update only this row. The WHERE also re-checks status='pending' so a
  // concurrent double-submit can't both succeed.
  const { data: updated, error: updateError } = await supabase
    .from("attestations")
    .update({
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
      attester_name: attesterName,
    })
    .eq("token", token)
    .eq("status", "pending")
    .select("id, confirmed_at")
    .maybeSingle();

  if (updateError) {
    console.error("Attestation confirm error:", updateError);
    return NextResponse.json(
      { error: "Failed to confirm attestation" },
      { status: 500 },
    );
  }
  if (!updated) {
    // Lost the race to another confirmation.
    return NextResponse.json(
      { error: "This attestation has already been confirmed." },
      { status: 409 },
    );
  }

  return NextResponse.json({ success: true, confirmed_at: updated.confirmed_at });
}
