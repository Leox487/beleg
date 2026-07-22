import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

import { createSupabaseServiceRoleClient } from "@/lib/supabase";
import type { Attestation, Entry, Venture } from "@/lib/types";
import { NewEntryForm } from "@/app/components/NewEntryForm";
import { CopyText } from "@/app/components/CopyText";
import { RequestAttestForm } from "@/app/components/RequestAttestForm";

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
  // occurred_at is a date column (YYYY-MM-DD); render without timezone shifting.
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function LedgerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createSupabaseServiceRoleClient();

  const { data: ventureData } = await supabase
    .from("ventures")
    .select("id, clerk_user_id, name, slug, tagline, created_at")
    .eq("id", id)
    .maybeSingle();

  const venture = ventureData as Venture | null;
  if (!venture || venture.clerk_user_id !== userId) notFound();

  const { data: entriesData } = await supabase
    .from("entries")
    .select(
      "id, venture_id, seq, kind, title, body, occurred_at, recorded_at, content_hash, prev_hash, chain_hash",
    )
    .eq("venture_id", venture.id)
    .order("seq", { ascending: true });

  const entries = (entriesData ?? []) as Entry[];
  // Render newest-first visually; seq numbering is preserved on each card.
  const ordered = [...entries].reverse();

  // All attestations for this venture, grouped by entry for per-card display.
  const { data: attestationData } = await supabase
    .from("attestations")
    .select(
      "id, venture_id, entry_id, attester_email, attester_name, statement, token, status, requested_at, confirmed_at",
    )
    .eq("venture_id", venture.id)
    .order("requested_at", { ascending: true });

  const attestations = (attestationData ?? []) as Attestation[];
  const attestationsByEntry = new Map<string, Attestation[]>();
  for (const a of attestations) {
    if (!a.entry_id) continue;
    const list = attestationsByEntry.get(a.entry_id) ?? [];
    list.push(a);
    attestationsByEntry.set(a.entry_id, list);
  }

  const publicUrl = `/p/${venture.slug}`;

  return (
    <main className="page">
      <div className="page-inner ledger">
        <header className="ledger-header">
          <h1 className="page-title">{venture.name}</h1>
          {venture.tagline ? (
            <p className="ledger-tagline">{venture.tagline}</p>
          ) : null}
          <div className="public-link">
            <span className="muted">Public proof page:</span>{" "}
            <CopyText value={publicUrl} />
            <a className="public-open" href={publicUrl} target="_blank" rel="noopener noreferrer">
              Open public page →
            </a>
          </div>
          <p className="append-note">
            Entries are append-only. Nothing on this ledger can be edited or
            deleted after recording.
          </p>
        </header>

        <section className="new-entry-section">
          <NewEntryForm ventureId={venture.id} />
        </section>

        {ordered.length === 0 ? (
          <p className="muted empty-chain">
            No entries yet. Record your first milestone above.
          </p>
        ) : (
          <div className="chain">
            {ordered.map((entry) => (
              <article key={entry.id} className="entry-card">
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
                <p className="entry-hash">
                  hash: {entry.chain_hash.slice(0, 16)}… ← prev:{" "}
                  {entry.prev_hash.slice(0, 16)}…
                </p>

                <div className="attest-list">
                  {(attestationsByEntry.get(entry.id) ?? []).map((a) =>
                    a.status === "confirmed" ? (
                      <p key={a.id} className="attest-confirmed">
                        ✓ Confirmed by {a.attester_name ?? "—"} ({a.attester_email})
                        {a.confirmed_at
                          ? ` on ${formatDateTime(a.confirmed_at)}`
                          : ""}{" "}
                        — “{a.statement}”
                      </p>
                    ) : (
                      <div key={a.id} className="attest-pending muted">
                        <span>
                          Awaiting confirmation from {a.attester_email}
                        </span>
                        <CopyText value={`/attest/${a.token}`} />
                      </div>
                    ),
                  )}
                  <RequestAttestForm entryId={entry.id} />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
