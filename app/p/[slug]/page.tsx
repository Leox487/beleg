import { notFound } from "next/navigation";

import { createSupabaseServiceRoleClient } from "@/lib/supabase";
import type { Entry, Venture } from "@/lib/types";
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

  // Oldest-first: a reader wants the story in order.
  const entries = (entriesData ?? []) as Entry[];

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

        <VerifyChain entries={entries} />

        {entries.length === 0 ? (
          <p className="muted empty-chain">This ledger has no entries yet.</p>
        ) : (
          <div className="chain">
            {entries.map((entry) => (
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
              </article>
            ))}
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
