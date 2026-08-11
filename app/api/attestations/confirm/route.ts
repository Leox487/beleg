import { NextResponse } from "next/server";

import { appendEntry } from "@/lib/chain";
import sql from "@/lib/supabase";

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

  const attesterNoteRaw = asTrimmedString(body.attester_note);
  if (attesterNoteRaw.length > 2000) {
    return NextResponse.json(
      { error: "Details must be 2,000 characters or fewer." },
      { status: 400 },
    );
  }
  const attesterNote = attesterNoteRaw.length > 0 ? attesterNoteRaw : null;

  const attestationRows = await sql`
    SELECT id, venture_id, entry_id, attester_email, statement, status
    FROM attestations
    WHERE token = ${token}
    LIMIT 1
  `;
  const attestation = attestationRows[0] as
    | {
        id: string;
        venture_id: string;
        entry_id: string | null;
        attester_email: string;
        statement: string;
        status: string;
      }
    | undefined;

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
  const confirmedAt = new Date().toISOString();
  const updatedRows = await sql`
    UPDATE attestations
    SET
      status = 'confirmed',
      confirmed_at = ${confirmedAt},
      attester_name = ${attesterName},
      attester_note = ${attesterNote}
    WHERE token = ${token} AND status = 'pending'
    RETURNING id, confirmed_at, attester_name, attester_note
  `;
  const updated = updatedRows[0] as
    | {
        id: string;
        confirmed_at: Date | string;
        attester_name: string | null;
        attester_note: string | null;
      }
    | undefined;

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
      const attestedEntryRows = await sql`
        SELECT seq, title FROM entries
        WHERE id = ${attestation.entry_id}
        LIMIT 1
      `;
      const attestedEntry = attestedEntryRows[0] as
        | { seq: number; title: string }
        | undefined;
      if (attestedEntry) {
        attestedSeq = Number(attestedEntry.seq);
        attestedTitle = attestedEntry.title;
      }
    }

    const bodyParts = [
      `Attests to entry #${attestedSeq ?? "?"}: "${attestedTitle}"`,
      `Statement confirmed: "${attestation.statement}"`,
    ];
    if (updated.attester_note) {
      bodyParts.push(`Attester details: "${updated.attester_note}"`);
    }
    bodyParts.push(
      `Attester: ${nameForCredit} <${attestation.attester_email}>`,
      "Confirmed via attestation link.",
    );
    const sealedBody = bodyParts.join("\n");

    const sealed = await appendEntry({
      venture_id: attestation.venture_id,
      kind: "attestation",
      title: `Confirmed by ${nameForCredit}`,
      body: sealedBody,
      occurred_at: null,
    });

    try {
      await sql`
        UPDATE attestations
        SET chain_entry_id = ${sealed.id}
        WHERE id = ${updated.id}
      `;
    } catch (linkError) {
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

  const confirmedAtOut =
    updated.confirmed_at instanceof Date
      ? updated.confirmed_at.toISOString()
      : String(updated.confirmed_at);

  return NextResponse.json({
    success: true,
    confirmed_at: confirmedAtOut,
  });
}
