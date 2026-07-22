import { createSupabaseServiceRoleClient } from "@/lib/supabase";
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

  const supabase = createSupabaseServiceRoleClient();

  const { data: attestationData } = await supabase
    .from("attestations")
    .select(
      "id, venture_id, entry_id, attester_email, attester_name, statement, token, status, requested_at, confirmed_at",
    )
    .eq("token", token)
    .maybeSingle();

  const attestation = attestationData as Attestation | null;

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
            You already confirmed this
            {attestation.confirmed_at
              ? ` on ${formatDateTime(attestation.confirmed_at)}`
              : ""}
            . Nothing further is needed.
          </p>
        </div>
      </main>
    );
  }

  // Load the entry being attested and its venture for context.
  const { data: entryData } = await supabase
    .from("entries")
    .select(
      "id, venture_id, seq, kind, title, body, occurred_at, recorded_at, content_hash, prev_hash, chain_hash",
    )
    .eq("id", attestation.entry_id ?? "")
    .maybeSingle();
  const entry = entryData as Entry | null;

  const { data: ventureData } = await supabase
    .from("ventures")
    .select("id, clerk_user_id, name, slug, tagline, created_at")
    .eq("id", attestation.venture_id)
    .maybeSingle();
  const venture = ventureData as Venture | null;

  const founderLabel = venture?.name ?? "The founder";

  return (
    <main className="page">
      <div className="attest-inner">
        <h1 className="page-title">Confirm an entry</h1>
        {venture ? <p className="ledger-tagline">{venture.name}</p> : null}

        <p className="attest-explainer">
          {founderLabel} is asking you to confirm this happened as described.
          Your confirmation will be publicly recorded alongside this entry,
          linked to your email address. Only confirm what you know to be true.
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
