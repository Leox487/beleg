import type { Metadata } from "next";

import { Footer } from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "Verify it yourself · Beleg",
  description:
    "Verify a Beleg ledger and its Bitcoin anchor using only open-source tools and public infrastructure.",
};

export default function VerifyGuidePage() {
  return (
    <main className="page">
      <div className="page-inner doc doc-narrow">
        <header className="doc-header">
          <p className="doc-eyebrow">For technical readers</p>
          <h1 className="h1 doc-title">Verify it yourself.</h1>
          <p className="doc-lead">
            No Beleg-hosted tool required. Just SHA-256 and the OpenTimestamps
            client.
          </p>
        </header>

        <div className="card doc-body">
          <h3>Why this page exists</h3>
          <p>
            Every verification tool we provide runs in your browser, but you
            still loaded it from our server. This page shows you how to verify a
            Beleg ledger using only open-source tools and public infrastructure.
          </p>

          <h3>Verifying the chain by hand</h3>
          <p>
            Entries are serialized as a JSON array in fixed order (
            <code>
              [venture_id, seq, kind, title, body, occurred_at, recorded_at]
            </code>
            ), with null values as empty strings and <code>recorded_at</code>{" "}
            normalized to ISO 8601 with a <code>Z</code> suffix. That string is
            hashed with SHA-256 to produce the content seal. The chain seal is{" "}
            <code>SHA-256(previous_chain_seal + content_seal)</code>.
          </p>
          <p>
            A worked example for the first entry in a ledger, where the previous
            chain seal is the genesis value (64 zeros):
          </p>
          <pre className="code-block">
            <code>{`# 1. The canonical string. Note: seq is a number, not a string,
#    and a null body becomes "" rather than null.
ENTRY='["8f14e45f-ceea-467a-9575-6dbbb1ee0d2c",1,"milestone","Grant received","","2026-07-14","2026-07-14T16:02:11.000Z"]'

# 2. Content seal
CONTENT=$(printf '%s' "$ENTRY" | sha256sum | cut -d' ' -f1)
# 78b7f533588166d93aa8527b29405129356693601d244f0e4d0e88f3b0a8e32f

# 3. Chain seal. prev_hash for entry #1 is the genesis value, 64 zeros.
PREV=$(printf '0%.0s' {1..64})
printf '%s' "$PREV$CONTENT" | sha256sum | cut -d' ' -f1
# cf5c7dc94f334207ca1d27a11e31d4715641f8b39d555e86e5e953a1d34fd139

# Compare those to content_hash and chain_hash on the entry.
# For entry #2, set PREV to entry #1's chain_hash and repeat.`}</code>
          </pre>

          <h3>Verifying a Bitcoin anchor</h3>
          <p>
            Download the <code>.ots</code> proof from a proof page, then verify
            it with the OpenTimestamps CLI. This checks the timestamp against
            the public Bitcoin blockchain with no dependency on Beleg.
          </p>
          <pre className="code-block">
            <code>{`pip install opentimestamps-client
ots verify yourfile.ots`}</code>
          </pre>

          <h3>Getting the raw data</h3>
          <p>
            Any public proof page&apos;s entry data is available as JSON at{" "}
            <code>/api/public/[slug]/entries</code>, the same record the proof
            page renders, in machine-readable form.
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
