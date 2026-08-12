import { notFound } from "next/navigation";

import { mapAnchor, mapEntry, mapVenture } from "@/lib/row";
import sql from "@/lib/supabase";
import type { Anchor, Entry, Venture } from "@/lib/types";
import { Footer } from "@/app/components/Footer";
import { Seal } from "@/app/components/Seal";
import { VerifyChain } from "@/app/components/VerifyChain";
import { DkimChip } from "@/app/components/DkimChip";

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

  const ventureRows = await sql`
    SELECT id, clerk_user_id, name, slug, tagline, created_at
    FROM ventures
    WHERE slug = ${slug}
    LIMIT 1
  `;
  const venture = ventureRows[0]
    ? (mapVenture(ventureRows[0] as Record<string, unknown>) as Venture)
    : null;
  if (!venture) notFound();

  const entryRows = await sql`
    SELECT
      id, venture_id, seq, kind, title, body, occurred_at, recorded_at,
      content_hash, prev_hash, chain_hash, source, dkim_verified
    FROM entries
    WHERE venture_id = ${venture.id}
    ORDER BY seq ASC
  `;

  // Oldest-first: a reader wants the story in order. Confirmations are no longer
  // read from the attestations table — they are sealed into the chain as
  // 'attestation'-kind entries, so they carry the same tamper-evidence as every
  // other entry and the in-browser verifier covers them too.
  const entries = entryRows.map((row) =>
    mapEntry(row as Record<string, unknown>),
  ) as Entry[];
  const latestSeq = entries.length > 0 ? entries[entries.length - 1].seq : 0;

  const anchorRows = await sql`
    SELECT
      id, venture_id, anchored_seq, chain_tip_hash, ots_proof, status,
      created_at, upgraded_at, bitcoin_block_height
    FROM anchors
    WHERE venture_id = ${venture.id}
    ORDER BY anchored_seq DESC
  `;
  const anchors = anchorRows.map((row) =>
    mapAnchor(row as Record<string, unknown>),
  ) as Anchor[];
  // Prefer the confirmed anchor covering the most entries; fall back to the
  // most recent pending one.
  const confirmedAnchor =
    anchors.find((a) => a.status === "confirmed") ?? null;
  const pendingAnchor = anchors.find((a) => a.status === "pending") ?? null;
  const entriesAfterAnchor =
    confirmedAnchor && latestSeq > confirmedAnchor.anchored_seq;

  return (
    <main className="page proof-page">
      <div className="page-inner ledger certificate">
        <p className="proof-preamble">
          This is a public proof page from Beleg. The person who created it does
          not control what you&apos;re about to verify.
        </p>

        <header className="ledger-header certificate-header spotlight spotlight-center">
          <Seal size="lg" ring label="Sealed record" />
          <h1 className="page-title certificate-title">{venture.name}</h1>
          {venture.tagline ? (
            <p className="ledger-tagline">{venture.tagline}</p>
          ) : null}
          <p className="badge-line muted">
            Sealed timeline · {entries.length}{" "}
            {entries.length === 1 ? "entry" : "entries"}
            {entries.length > 0
              ? ` · started ${formatStarted(entries[0].recorded_at)}`
              : ""}
          </p>
        </header>

        <hr className="rule-fade" />

        {confirmedAnchor ? (
          <section className="anchor-proof anchor-proof-confirmed card-gradient">
            <span
              className="anchor-glyph anchor-pulse seal seal-gold seal-lg"
              aria-hidden="true"
            >
              ⚓
            </span>
            <div className="anchor-proof-body">
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
                Entries recorded after the last anchor are covered by the sealed
                chain but not yet independently timestamped.
              </p>
            ) : null}
            <p className="anchor-proof-fine muted">
              Bitcoin&apos;s blockchain is not owned by Beleg. It&apos;s a public
              system that timestamps data in a way nobody, including us, can
              rewrite.
            </p>
            </div>
          </section>
        ) : pendingAnchor ? (
          <section className="anchor-proof anchor-proof-pending card-gradient">
            <span className="anchor-glyph seal seal-gold seal-lg" aria-hidden="true">
              ◐
            </span>
            <div className="anchor-proof-body">
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
              <p className="anchor-proof-fine muted">
                Bitcoin&apos;s blockchain is not owned by Beleg. It&apos;s a
                public system that timestamps data in a way nobody, including us,
                can rewrite.
              </p>
            </div>
          </section>
        ) : null}

        <hr className="rule-fade" />

        <div className="spotlight spotlight-center verify-spotlight">
          <VerifyChain entries={entries} ventureId={venture.id} />
        </div>

        <hr className="rule-fade" />

        {entries.length === 0 ? (
          <p className="muted empty-chain">This ledger has no entries yet.</p>
        ) : (
          <div className="chain">
            {entries.map((entry, i) => {
              const isEmail =
                entry.source === "email" || entry.kind === "email";
              return (
              <div key={entry.id} className="chain-entry-wrap">
                {i > 0 ? <hr className="rule-fade chain-rule" /> : null}
                {entry.kind === "attestation" ? (
                  <article className="entry-card entry-attestation attest-confirmed card-gradient">
                    <div className="entry-top">
                      <span className="entry-seq">#{entry.seq}</span>
                      <span className="badge badge-attestation">
                        ✓ attestation
                      </span>
                    </div>
                    <h3 className="entry-title">{entry.title}</h3>
                    {entry.body ? (
                      <p className="entry-body entry-body-attest">{entry.body}</p>
                    ) : null}
                    <p className="entry-recorded muted">
                      Recorded {formatDateTime(entry.recorded_at)}
                    </p>
                    <p className="seal-line">
                      <span className="seal-label">SEAL</span>
                      <span className="seal-hash">
                        {entry.chain_hash.slice(0, 24)}…
                      </span>
                    </p>
                  </article>
                ) : (
                  <article className="entry-card card-gradient">
                    <div className="entry-top">
                      <span className="entry-seq">#{entry.seq}</span>
                      <span className="badge">{entry.kind}</span>
                      {isEmail ? (
                        <span className="badge badge-email">EMAIL</span>
                      ) : null}
                      {isEmail ? (
                        <DkimChip verified={entry.dkim_verified} />
                      ) : null}
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
                    <p className="seal-line">
                      <span className="seal-label">SEAL</span>
                      <span className="seal-hash">
                        {entry.chain_hash.slice(0, 24)}…
                      </span>
                    </p>
                  </article>
                )}
              </div>
              );
            })}
          </div>
        )}

        <footer className="proof-footer">
          <h2 className="proof-footer-title">How to read this page</h2>
          <p>
            Every entry below has a cryptographic seal linking it to the one
            before it. If anything were changed, edited, or reordered after the
            fact, the seals would break and the verifier above would say so.
          </p>
          <p>
            Each entry is cryptographically sealed and linked to the one before
            it. Editing, deleting, or reordering any past entry would break every
            seal after it. Verification runs in your browser — this server is not
            trusted with the answer.
          </p>
          <p>
            Confirmations from third parties are themselves recorded as sealed
            entries in the chain — they carry the same protection as everything
            else, and the verifier above checks them too.
          </p>
          <p className="proof-footer-fine muted">
            This ledger proves when entries were recorded and that they haven&apos;t
            changed since. It does not by itself prove the underlying claims are
            true.
          </p>
        </footer>
      </div>

      <Footer />
    </main>
  );
}
