import { mapAttestation, mapEntry, mapVenture } from "@/lib/row";
import sql from "@/lib/supabase";
import type { Attestation, Entry, Venture } from "@/lib/types";
import { AttestForm } from "@/app/components/AttestForm";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AttestPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const attestationRows = await sql`
    SELECT
      id, venture_id, entry_id, attester_email, attester_name, statement,
      attester_note, token, status, requested_at, confirmed_at, chain_entry_id
    FROM attestations
    WHERE token = ${token}
    LIMIT 1
  `;

  const attestation = attestationRows[0]
    ? (mapAttestation(attestationRows[0] as Record<string, unknown>) as Attestation)
    : null;

  if (!attestation) {
    return (
      <main className="page">
        <div className="attest-inner">
          <h1 className="page-title">This link is invalid</h1>
          <p className="muted">
            We couldn&apos;t find an attestation for this link. Check that you
            copied the full URL, or ask the sender for a new one.
          </p>
        </div>
      </main>
    );
  }

  if (attestation.status === "confirmed") {
    return (
      <main className="page">
        <div className="attest-inner">
          <h1 className="page-title">Already confirmed</h1>
          <p className="muted">
            You confirmed this
            {attestation.confirmed_at
              ? ` on ${formatDateTime(attestation.confirmed_at)}`
              : ""}
            . Nothing more to do — thanks.
          </p>
          {attestation.attester_note ? (
            <div className="attest-statement">
              <span className="field-label">Details you added:</span>
              <blockquote>{attestation.attester_note}</blockquote>
            </div>
          ) : null}
        </div>
      </main>
    );
  }

  // Load the entry being attested and its venture for context.
  let entry: Entry | null = null;
  if (attestation.entry_id) {
    const entryRows = await sql`
      SELECT
        id, venture_id, seq, kind, title, body, occurred_at, recorded_at,
        content_hash, prev_hash, chain_hash, source, dkim_verified
      FROM entries
      WHERE id = ${attestation.entry_id}
      LIMIT 1
    `;
    entry = entryRows[0]
      ? mapEntry(entryRows[0] as Record<string, unknown>)
      : null;
  }

  const ventureRows = await sql`
    SELECT id, clerk_user_id, name, slug, tagline, created_at
    FROM ventures
    WHERE id = ${attestation.venture_id}
    LIMIT 1
  `;
  const venture = ventureRows[0]
    ? (mapVenture(ventureRows[0] as Record<string, unknown>) as Venture)
    : null;

  const founderLabel = venture?.name ?? "The founder";

  return (
    <main className="page">
      <div className="attest-inner">
        <h1 className="page-title">Confirm an entry</h1>
        {venture ? <p className="ledger-tagline">{venture.name}</p> : null}

        <p className="attest-framing">
          {founderLabel} is asking you to confirm this happened as described.
        </p>

        <p className="attest-explainer">
          Only confirm what you know to be true. Your confirmation becomes a
          permanent part of this venture&apos;s public record.
        </p>

        {entry ? (
          <article className="entry-card attest-entry">
            <div className="entry-top">
              <span className="entry-seq">#{entry.seq}</span>
              <span className="badge">{entry.kind}</span>
            </div>
            <h3 className="entry-title">{entry.title}</h3>
            {entry.body ? <p className="entry-body">{entry.body}</p> : null}
            {entry.occurred_at ? (
              <p className="entry-occurred">
                Occurred {formatDate(entry.occurred_at)}
              </p>
            ) : null}
            <p className="entry-recorded muted">
              Recorded {formatDateTime(entry.recorded_at)}
            </p>
          </article>
        ) : (
          <p className="muted">The linked entry could not be loaded.</p>
        )}

        <div className="attest-statement">
          <span className="field-label">You are being asked to confirm:</span>
          <blockquote>{attestation.statement}</blockquote>
        </div>

        <AttestForm
          token={attestation.token}
          initialName={attestation.attester_name ?? ""}
        />
      </div>
    </main>
  );
}
