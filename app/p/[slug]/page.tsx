import { notFound } from "next/navigation";

import { createSupabaseServiceRoleClient } from "@/lib/supabase";
import type { Anchor, Entry, Venture } from "@/lib/types";
import { VerifyChain } from "@/app/components/VerifyChain";

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

function formatStarted(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function PublicProofPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = createSupabaseServiceRoleClient();

  const { data: ventureData } = await supabase
    .from("ventures")
    .select("id, clerk_user_id, name, slug, tagline, created_at")
    .eq("slug", slug)
    .maybeSingle();

  const venture = ventureData as Venture | null;
  if (!venture) notFound();

  const { data: entriesData } = await supabase
    .from("entries")
    .select(
      "id, venture_id, seq, kind, title, body, occurred_at, recorded_at, content_hash, prev_hash, chain_hash",
    )
    .eq("venture_id", venture.id)
    .order("seq", { ascending: true });

  // Oldest-first: a reader wants the story in order. Confirmations are no longer
  // read from the attestations table — they are sealed into the chain as
  // 'attestation'-kind entries, so they carry the same tamper-evidence as every
  // other entry and the in-browser verifier covers them too.
  const entries = (entriesData ?? []) as Entry[];
  const latestSeq = entries.length > 0 ? entries[entries.length - 1].seq : 0;

  const { data: anchorData } = await supabase
    .from("anchors")
    .select(
      "id, venture_id, anchored_seq, chain_tip_hash, status, created_at, upgraded_at, bitcoin_block_height",
    )
    .eq("venture_id", venture.id)
    .order("anchored_seq", { ascending: false });

  const anchors = (anchorData ?? []) as Anchor[];
  // Prefer the confirmed anchor covering the most entries; fall back to the
  // most recent pending one.
  const confirmedAnchor =
    anchors.find((a) => a.status === "confirmed") ?? null;
  const pendingAnchor = anchors.find((a) => a.status === "pending") ?? null;
  const entriesAfterAnchor =
    confirmedAnchor && latestSeq > confirmedAnchor.anchored_seq;

  return (
    <main className="page">
      <div className="page-inner ledger">
        <header className="ledger-header">
          <h1 className="page-title">{venture.name}</h1>
          {venture.tagline ? (
            <p className="ledger-tagline">{venture.tagline}</p>
          ) : null}
          <p className="badge-line muted">
            Append-only ledger · {entries.length}{" "}
            {entries.length === 1 ? "entry" : "entries"}
            {entries.length > 0
              ? ` · started ${formatStarted(entries[0].recorded_at)}`
              : ""}
          </p>
        </header>

        {confirmedAnchor ? (
          <section className="anchor-proof anchor-proof-confirmed">
            <p className="anchor-proof-headline">
              ✓ Anchored to Bitcoin — entries #1–{confirmedAnchor.anchored_seq}{" "}
              provably existed as of{" "}
              {formatDateTime(
                confirmedAnchor.upgraded_at ?? confirmedAnchor.created_at,
              )}
              .
            </p>
            <p className="anchor-proof-explainer">
              This ledger&apos;s fingerprint was committed to the Bitcoin
              blockchain, which means its contents provably existed at that time
              and cannot be backdated — verifiable without trusting this
              website.
            </p>
            <a
              className="anchor-download"
              href={`/api/anchor/${confirmedAnchor.id}/proof`}
            >
              Download proof (.ots)
            </a>
            {entriesAfterAnchor ? (
              <p className="anchor-proof-fine muted">
                Entries recorded after the last anchor are covered by the hash
                chain but not yet independently timestamped.
              </p>
            ) : null}
          </section>
        ) : pendingAnchor ? (
          <section className="anchor-proof anchor-proof-pending">
            <p className="anchor-proof-headline">
              Anchor submitted {formatDateTime(pendingAnchor.created_at)},
              awaiting Bitcoin confirmation.
            </p>
            <a
              className="anchor-download"
              href={`/api/anchor/${pendingAnchor.id}/proof`}
            >
              Download proof (.ots)
            </a>
          </section>
        ) : null}

        <VerifyChain entries={entries} />

        {entries.length === 0 ? (
          <p className="muted empty-chain">This ledger has no entries yet.</p>
        ) : (
          <div className="chain">
            {entries.map((entry) =>
              entry.kind === "attestation" ? (
                <article
                  key={entry.id}
                  className="entry-card entry-attestation"
                >
                  <div className="entry-top">
                    <span className="entry-seq">#{entry.seq}</span>
                    <span className="badge badge-attestation">
                      ✓ attestation
                    </span>
                  </div>
                  <h3 className="entry-title">{entry.title}</h3>
                  {entry.body ? (
                    <p className="entry-body">{entry.body}</p>
                  ) : null}
                  <p className="entry-recorded muted">
                    Recorded {formatDateTime(entry.recorded_at)}
                  </p>
                  <p className="entry-hash">
                    hash: {entry.chain_hash.slice(0, 16)}… ← prev:{" "}
                    {entry.prev_hash.slice(0, 16)}…
                  </p>
                </article>
              ) : (
                <article key={entry.id} className="entry-card">
                  <div className="entry-top">
                    <span className="entry-seq">#{entry.seq}</span>
                    <span className="badge">{entry.kind}</span>
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
                </article>
              ),
            )}
          </div>
        )}

        <footer className="proof-footer">
          <h2 className="proof-footer-title">How to read this page</h2>
          <p>
            Each entry is cryptographically sealed and linked to the one before
            it. Editing, deleting, or reordering any past entry would break every
            seal after it. Verification runs in your browser — this server is not
            trusted with the answer.
          </p>
          <p>
            Confirmations from third parties are themselves recorded as sealed
            entries in the chain — they carry the same tamper-evidence as
            everything else, and the verifier above checks them too.
          </p>
          <p className="proof-footer-fine muted">
            This ledger proves when entries were recorded and that they haven&apos;t
            changed since. It does not by itself prove the underlying claims are
            true.
          </p>
        </footer>
      </div>
    </main>
  );
}
