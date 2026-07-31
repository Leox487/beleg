import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

import { createSupabaseServiceRoleClient } from "@/lib/supabase";
import type { Anchor, Attestation, Entry, Venture } from "@/lib/types";
import { NewEntryForm } from "@/app/components/NewEntryForm";
import { CopyText } from "@/app/components/CopyText";
import { RequestAttestForm } from "@/app/components/RequestAttestForm";
import { AnchorButton } from "@/app/components/AnchorButton";

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

  // Past anchors, newest first, for the anchoring panel.
  const { data: anchorData } = await supabase
    .from("anchors")
    .select(
      "id, venture_id, anchored_seq, chain_tip_hash, status, created_at, upgraded_at, bitcoin_block_height",
    )
    .eq("venture_id", venture.id)
    .order("created_at", { ascending: false });

  const anchors = (anchorData ?? []) as Anchor[];
  const latestSeq = entries.length > 0 ? entries[entries.length - 1].seq : 0;
  const tipAlreadyAnchored = anchors.some(
    (a) => a.anchored_seq === latestSeq && latestSeq > 0,
  );

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
            Entries are permanent. Once recorded, nothing on this ledger can be
            edited or deleted.
          </p>
        </header>

        {entries.length === 0 ? (
          <section className="entry-empty">
            <h2 className="entry-empty-title">No entries yet.</h2>
            <p className="entry-empty-text">
              An entry is anything real that happened — a milestone, a paying
              customer, a signed pilot, a shipped prototype. Add your first
              below.
            </p>
            <p className="entry-empty-label">Examples:</p>
            <ul className="entry-empty-list">
              <li>Shipped v1 of the prototype</li>
              <li>Signed pilot agreement with Acme Health</li>
              <li>First paying customer at $500/mo</li>
              <li>Approved by IRB for pilot testing</li>
            </ul>
          </section>
        ) : null}

        <section className="new-entry-section">
          <NewEntryForm ventureId={venture.id} />
        </section>

        <section className="anchor-section">
          <div className="anchor-header">
            <h2 className="section-title">Bitcoin anchoring</h2>
            <p className="muted">
              Anchoring commits the current chain tip to the Bitcoin blockchain
              via OpenTimestamps, proving these entries existed by a certain
              time — verifiable without trusting Beleg.
            </p>
          </div>

          {entries.length === 0 ? (
            <p className="muted">Record an entry before anchoring.</p>
          ) : tipAlreadyAnchored ? (
            <p className="muted">
              The current chain tip (entry #{latestSeq}) is already anchored.
              Add a new entry to anchor again.
            </p>
          ) : (
            <AnchorButton ventureId={venture.id} />
          )}

          {anchors.length > 0 ? (
            <ul className="anchor-list">
              {anchors.map((a) => (
                <li key={a.id} className="anchor-item">
                  <div className="anchor-item-main">
                    <span className="anchor-seq">Sealed at entry #{a.anchored_seq}</span>
                    <span
                      className={
                        a.status === "confirmed"
                          ? "badge badge-attestation"
                          : "badge"
                      }
                    >
                      {a.status === "confirmed"
                        ? `✓ Confirmed in block ${a.bitcoin_block_height ?? "?"}`
                        : "Pending Bitcoin confirmation"}
                    </span>
                  </div>
                  <p className="muted anchor-meta">
                    Submitted {formatDateTime(a.created_at)}
                    {a.upgraded_at
                      ? ` · confirmed ${formatDateTime(a.upgraded_at)}`
                      : ""}
                  </p>
                  <a
                    className="anchor-download"
                    href={`/api/anchor/${a.id}/proof`}
                  >
                    Download proof (.ots)
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        {ordered.length === 0 ? null : (
          <div className="chain">
            {ordered.map((entry) => {
              const isAttestation = entry.kind === "attestation";
              // Only pending requests are working state shown under an entry;
              // confirmed attestations now live in the timeline as their own
              // sealed chain entries.
              const pending = (attestationsByEntry.get(entry.id) ?? []).filter(
                (a) => a.status !== "confirmed",
              );
              return (
                <article
                  key={entry.id}
                  className={
                    isAttestation ? "entry-card entry-attestation" : "entry-card"
                  }
                >
                  <div className="entry-top">
                    <span className="entry-seq">#{entry.seq}</span>
                    <span
                      className={
                        isAttestation ? "badge badge-attestation" : "badge"
                      }
                    >
                      {isAttestation ? "✓ attestation" : entry.kind}
                    </span>
                  </div>
                  <h3 className="entry-title">{entry.title}</h3>
                  {entry.body ? (
                    <p className="entry-body">{entry.body}</p>
                  ) : null}
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

                  {/* Attestation entries are themselves evidence — you don't
                      attest an attestation, so no request UI on those. */}
                  {isAttestation ? null : (
                    <div className="attest-list">
                      {pending.map((a) => (
                        <div key={a.id} className="attest-pending muted">
                          <span>
                            Awaiting confirmation from {a.attester_email}
                          </span>
                          <CopyText value={`/attest/${a.token}`} />
                        </div>
                      ))}
                      <RequestAttestForm entryId={entry.id} />
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
