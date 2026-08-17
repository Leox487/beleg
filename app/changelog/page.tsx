import type { Metadata } from "next";

import { Footer } from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "Changelog · Beleg",
  description:
    "What shipped, when, and what broke along the way. The honest build history of Beleg.",
};

const ENTRIES = [
  {
    seq: "#08",
    date: "Jul 2026",
    text: "Dark theme, product-first hero, bento feature grid, full footer.",
  },
  {
    seq: "#07",
    date: "Jul 2026",
    text: "Bitcoin anchoring via OpenTimestamps. Chain tips are now independently timestamped against the public Bitcoin blockchain, with downloadable .ots proofs.",
  },
  {
    seq: "#06",
    date: "Jul 2026",
    text: "Attestation confirmations are now sealed into the chain as their own entries, so witness confirmations carry the same tamper-evidence as everything else.",
  },
  {
    seq: "#05",
    date: "Jul 2026",
    text: "Attestations. Request a one-click confirmation from anyone who witnessed a milestone. No account required on their end.",
  },
  {
    seq: "#04",
    date: "Jul 2026",
    text: "Public proof pages with in-browser chain verification.",
  },
  {
    seq: "#03",
    date: "Jul 2026",
    text: "Fixed a canonicalization bug where timestamps serialized differently on database round-trip, breaking verification on untampered chains.",
  },
  {
    seq: "#02",
    date: "Jul 2026",
    text: "Ledger view, entry recording, append-only enforcement.",
  },
  {
    seq: "#01",
    date: "Jul 2026",
    text: "First sealed entry.",
  },
];

export default function ChangelogPage() {
  return (
    <main className="page">
      <div className="page-inner doc doc-narrow">
        <header className="doc-header">
          <p className="doc-eyebrow">Build history</p>
          <h1 className="h1 doc-title">Changelog</h1>
        </header>

        <div className="card doc-body">
          <ol className="log-list">
            {ENTRIES.map((entry) => (
              <li key={entry.seq} className="log-item">
                <div className="log-meta">
                  <span className="log-seq">{entry.seq}</span>
                  <span>{entry.date}</span>
                </div>
                <p className="log-text">{entry.text}</p>
              </li>
            ))}
          </ol>
        </div>

        <p className="doc-note">
          This changelog is the honest version, including the bugs.
        </p>
      </div>

      <Footer />
    </main>
  );
}
