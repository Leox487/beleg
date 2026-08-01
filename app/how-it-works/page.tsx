import type { Metadata } from "next";

import { Footer } from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "How Beleg Works — Beleg",
  description:
    "The cryptography behind Beleg in plain English: hash chains, in-browser verification, and Bitcoin anchoring.",
};

export default function HowItWorksPage() {
  return (
    <main className="page">
      <div className="page-inner doc">
        <header className="doc-header">
          <h1 className="h1 doc-title">How Beleg Works</h1>
        </header>

        <div className="card doc-body">
          <p>
            This page explains the cryptography behind Beleg in plain English.
            No prior knowledge required.
          </p>

          <h2>The chain</h2>
          <p>
            Every entry you add gets a &quot;hash&quot; — a digital fingerprint
            created by running the entry&apos;s contents (title, body, date,
            timestamp) through a mathematical function called SHA-256. The same
            input always produces the same fingerprint. Even changing one
            character produces a completely different fingerprint.
          </p>
          <p>
            Each entry&apos;s hash is computed from two things: the entry&apos;s
            own contents, and the previous entry&apos;s hash. This links them
            into a chain. The first entry links to a special
            &quot;genesis&quot; value (all zeros). Entry #2 links to entry #1.
            Entry #3 links to entry #2. And so on.
          </p>
          <p>
            If anyone changed entry #1 after the fact, its hash would change.
            But entry #2&apos;s hash depends on entry #1&apos;s hash — so entry
            #2&apos;s hash would also change. And entry #3 depends on entry #2.
            The entire chain after the edit breaks. That&apos;s why it&apos;s
            called &quot;append-only&quot; — you can only add to the end, never
            change the past.
          </p>

          <h2>The verifier</h2>
          <p>
            When you open a public proof page, the &quot;Verify chain&quot;
            button runs entirely in your browser. It downloads every
            entry&apos;s data, recomputes every hash from scratch using the same
            SHA-256 function, and checks that every link holds. If everything
            matches, you see a green banner. If anything was tampered with, you
            see red — and it tells you exactly which entry broke.
          </p>
          <p>
            This is important: the verification does not trust Beleg&apos;s
            server. Your browser does the math independently. Even if
            Beleg&apos;s database were compromised, the verifier would catch it
            — because the attacker would need to recompute every hash in the
            chain to make a forgery pass, and the anchoring (below) makes even
            that impossible.
          </p>

          <h2>Attestations</h2>
          <p>
            When a third party confirms an entry, their confirmation is itself
            added to the chain as a new sealed entry. It gets its own hash,
            linking to whatever came before it. So attestations carry the same
            tamper-evidence as everything else — they can&apos;t be edited,
            backdated, or removed after the fact.
          </p>

          <h2>Bitcoin anchoring</h2>
          <p>
            Periodically, the latest hash in your chain is submitted to the
            Bitcoin blockchain via OpenTimestamps — a free, open protocol.
            Bitcoin&apos;s blockchain is a public ledger maintained by thousands
            of independent computers worldwide. Once your hash is recorded
            there, it is provably timestamped against infrastructure that nobody
            — not Beleg, not you, not anyone — controls or can rewrite.
          </p>
          <p>
            This means: even if Beleg disappeared tomorrow, anyone with the .ots
            proof file could independently verify that your ledger existed at
            that date, using only open-source tools and the public Bitcoin
            blockchain. No trust in any company required.
          </p>

          <h2>What this doesn&apos;t do</h2>
          <p>
            Beleg proves integrity (nothing changed) and timing (when it was
            recorded). It does not prove truth (whether the claim is accurate).
            A sealed entry saying &quot;shipped the prototype&quot; proves you
            wrote those words on that date — proving the prototype actually
            shipped requires witnesses (attestations) and evidence (which future
            versions will support through verified email ingestion and payment
            connectors).
          </p>

          <h2>Open verification</h2>
          <p>
            The SHA-256 hash function is a public standard — anyone can
            implement it. The chain structure is a standard Merkle-style linked
            list. OpenTimestamps is open source. Nothing about Beleg&apos;s
            verification requires proprietary software or trusting a third
            party. That&apos;s the point.
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
