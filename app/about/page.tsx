import type { Metadata } from "next";

import { Footer } from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "About — Beleg",
  description:
    "Why Beleg exists: in a world where every application sounds perfect, the scarce resource is proof.",
};

export default function AboutPage() {
  return (
    <main className="page">
      <div className="page-inner doc">
        <header className="doc-header">
          <h1 className="h1 doc-title">About Beleg</h1>
        </header>

        <div className="card doc-body">
          <p>
            Beleg (German: &quot;proof&quot; or &quot;receipt&quot;) is an
            append-only, cryptographically sealed ledger for founders.
          </p>

          <h2>The problem</h2>
          <p>
            Applications — for grants, competitions, accelerators, investment —
            are drowning in AI-polished claims. Everyone&apos;s traction sounds
            perfect because everyone&apos;s essay was written by the same
            models. When claims are free to fabricate, the scarce resource is no
            longer persuasion — it&apos;s proof.
          </p>

          <h2>What Beleg does</h2>
          <p>
            You record milestones as they happen. Each entry is
            cryptographically sealed and linked to the one before it — editing,
            deleting, or reordering anything would break every seal after it.
            You can invite witnesses to confirm entries with one click, and
            their confirmations are sealed into the same chain. The whole ledger
            is periodically anchored to the Bitcoin blockchain, so its existence
            at a specific date is provable against infrastructure nobody
            controls.
          </p>
          <p>
            The result is a single shareable link — your public proof page —
            where anyone evaluating you can independently verify your record in
            their own browser, without trusting Beleg or trusting you.
          </p>

          <h2>What Beleg does not do</h2>
          <p>
            Beleg does not prove your claims are true. It proves when they were
            recorded and that they haven&apos;t changed. Truth comes from the
            witnesses who attest and the evidence you accumulate — the chain
            just makes sure nobody (including you) can rewrite the history after
            the fact.
          </p>

          <h2>Who built this</h2>
          <p>
            Beleg started as a question: in a world where AI makes every
            application sound perfect, what would a trust layer for founders
            actually look like?
          </p>
          <p>The answer wasn&apos;t another AI tool. It was math.</p>

          <h2>Status</h2>
          <p>
            Beleg is in beta. It is free to use. The codebase is real, the
            cryptography is real, the Bitcoin anchoring is real. If something
            breaks, email{" "}
            <a href="mailto:beleg.app@proton.me">beleg.app@proton.me</a>.
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
