import { NextResponse } from "next/server";

import { createSupabaseServiceRoleClient } from "@/lib/supabase";
import { appendEntry } from "@/lib/chain";

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
    .select("id, venture_id, entry_id, attester_email, statement, status")
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
    .select("id, confirmed_at, attester_name")
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

  // Seal the confirmation into the hash chain as its own entry. If this fails,
  // we still return success (the attester's confirmation IS recorded on the
  // attestations row) but log loudly so the half-written state is surfaced.
  try {
    const nameForCredit = updated.attester_name ?? "an unnamed attester";

    // Load the attested entry to reference it deterministically in the body.
    let attestedSeq: number | null = null;
    let attestedTitle = "";
    if (attestation.entry_id) {
      const { data: attestedEntry } = await supabase
        .from("entries")
        .select("seq, title")
        .eq("id", attestation.entry_id)
        .maybeSingle();
      if (attestedEntry) {
        attestedSeq = attestedEntry.seq as number;
        attestedTitle = attestedEntry.title as string;
      }
    }

    const body =
      `Attests to entry #${attestedSeq ?? "?"}: "${attestedTitle}" — ` +
      `Statement: "${attestation.statement}" — ` +
      `Attester: ${nameForCredit} <${attestation.attester_email}> — ` +
      `Confirmed via attestation link.`;

    const sealed = await appendEntry({
      venture_id: attestation.venture_id,
      kind: "attestation",
      title: `Confirmed by ${nameForCredit}`,
      body,
      occurred_at: null,
    });

    const { error: linkError } = await supabase
      .from("attestations")
      .update({ chain_entry_id: sealed.id })
      .eq("id", updated.id);

    if (linkError) {
      console.error(
        `Attestation ${updated.id} sealed as entry ${sealed.id} but failed to store chain_entry_id:`,
        linkError,
      );
    }
  } catch (e) {
    console.error(
      `CRITICAL: attestation ${updated.id} confirmed but failed to seal into chain:`,
      e,
    );
  }

  return NextResponse.json({ success: true, confirmed_at: updated.confirmed_at });
}
