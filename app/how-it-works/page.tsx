import type { Metadata } from "next";

import Accordion from "@/app/components/Accordion";
import AnimateIn from "@/app/components/AnimateIn";
import ChainLab from "@/app/components/ChainLab";
import { Footer } from "@/app/components/Footer";
import HowBeats from "@/app/components/HowBeats";

export const metadata: Metadata = {
  title: "How Beleg Works — Beleg",
  description:
    "The cryptography behind Beleg in plain English: hash chains, in-browser verification, and Bitcoin anchoring.",
};

export default function HowItWorksPage() {
  return (
    <main className="page how-page">
      <div className="page-inner doc doc-how">
        <header className="doc-header how-header">
          <h1 className="h1 doc-title how-title">How Beleg Works</h1>
          <p className="how-desc">
            Beleg is a running record of what you have actually done. Each
            milestone you add is sealed with a cryptographic fingerprint and
            linked to the one before it, so nothing in the past can be quietly
            rewritten. The people who were there can confirm entries themselves,
            and anyone you share the record with can check every seal in their
            own browser &mdash; without taking your word for it, or ours.
          </p>
        </header>

        <AnimateIn direction="up">
          <section className="how-section">
            <p className="how-eyebrow">The 20-second version</p>
            <HowBeats />
          </section>
        </AnimateIn>

        <AnimateIn direction="up">
          <section className="how-section">
            <p className="how-eyebrow">Try it</p>
            <h2 className="how-heading">Break the chain yourself.</h2>
            <p className="how-sub">
              These are real SHA-256 seals, computed in your browser right now.
              Change a single character in entry #1 and watch what happens to
              everything after it.
            </p>
            <div className="card how-lab-card">
              <ChainLab />
            </div>
          </section>
        </AnimateIn>

        <AnimateIn direction="up">
          <section className="how-section">
            <p className="how-eyebrow">The long version</p>
            <h2 className="how-heading">
              Every detail, if you want to check our work.
            </h2>

            <div className="how-accordion">
              <Accordion title="The chain">
                <p>
                  Every entry you add gets a &quot;hash&quot; — a digital
                  fingerprint created by running the entry&apos;s contents
                  (title, body, date, timestamp) through a mathematical function
                  called SHA-256. The same input always produces the same
                  fingerprint. Even changing one character produces a completely
                  different fingerprint.
                </p>
                <p>
                  Each entry&apos;s hash is computed from two things: the
                  entry&apos;s own contents, and the previous entry&apos;s hash.
                  This links them into a chain. The first entry links to a
                  special &quot;genesis&quot; value (all zeros). Entry #2 links
                  to entry #1. Entry #3 links to entry #2. And so on.
                </p>
                <p>
                  If anyone changed entry #1 after the fact, its hash would
                  change. But entry #2&apos;s hash depends on entry #1&apos;s
                  hash — so entry #2&apos;s hash would also change. And entry #3
                  depends on entry #2. The entire chain after the edit breaks.
                  That&apos;s why it&apos;s called &quot;append-only&quot; — you
                  can only add to the end, never change the past.
                </p>
              </Accordion>

              <Accordion title="The verifier">
                <p>
                  When you open a public proof page, the &quot;Verify chain&quot;
                  button runs entirely in your browser. It downloads every
                  entry&apos;s data, recomputes every hash from scratch using the
                  same SHA-256 function, and checks that every link holds. If
                  everything matches, you see a green banner. If anything was
                  tampered with, you see red — and it tells you exactly which
                  entry broke.
                </p>
                <p>
                  This is important: the verification does not trust Beleg&apos;s
                  server. Your browser does the math independently. Even if
                  Beleg&apos;s database were compromised, the verifier would
                  catch it — because the attacker would need to recompute every
                  hash in the chain to make a forgery pass, and the anchoring
                  (below) makes even that impossible.
                </p>
              </Accordion>

              <Accordion title="Attestations">
                <p>
                  When a third party confirms an entry, their confirmation is
                  itself added to the chain as a new sealed entry. It gets its
                  own hash, linking to whatever came before it. So attestations
                  carry the same tamper-evidence as everything else — they
                  can&apos;t be edited, backdated, or removed after the fact.
                </p>
              </Accordion>

              <Accordion title="Bitcoin anchoring">
                <p>
                  Periodically, the latest hash in your chain is submitted to the
                  Bitcoin blockchain via OpenTimestamps — a free, open protocol.
                  Bitcoin&apos;s blockchain is a public ledger maintained by
                  thousands of independent computers worldwide. Once your hash is
                  recorded there, it is provably timestamped against
                  infrastructure that nobody — not Beleg, not you, not anyone —
                  controls or can rewrite.
                </p>
                <p>
                  This means: even if Beleg disappeared tomorrow, anyone with the
                  .ots proof file could independently verify that your ledger
                  existed at that date, using only open-source tools and the
                  public Bitcoin blockchain. No trust in any company required.
                </p>
              </Accordion>

              <Accordion title="What this doesn't do">
                <p>
                  Beleg proves integrity (nothing changed) and timing (when it
                  was recorded). It does not prove truth (whether the claim is
                  accurate). A sealed entry saying &quot;shipped the
                  prototype&quot; proves you wrote those words on that date —
                  proving the prototype actually shipped requires witnesses
                  (attestations) and evidence (which future versions will support
                  through verified email ingestion and payment connectors).
                </p>
              </Accordion>

              <Accordion title="Open verification">
                <p>
                  The SHA-256 hash function is a public standard — anyone can
                  implement it. The chain structure is a standard Merkle-style
                  linked list. OpenTimestamps is open source. Nothing about
                  Beleg&apos;s verification requires proprietary software or
                  trusting a third party. That&apos;s the point.
                </p>
              </Accordion>
            </div>
          </section>
        </AnimateIn>
      </div>

      <Footer />
    </main>
  );
}
