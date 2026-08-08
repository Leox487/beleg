import type { Metadata } from "next";

import { Footer } from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "Glossary — Beleg",
  description:
    "Plain-English definitions for every term Beleg uses: hash, seal, chain, anchoring, and more.",
};

const TERMS = [
  {
    term: "Hash",
    def: "A short fingerprint of a piece of data, produced by a mathematical function. The same input always produces the same fingerprint. Change one character and the fingerprint changes completely. Beleg uses SHA-256, a public standard your browser already implements.",
  },
  {
    term: "Seal",
    def: "What we call the hash attached to an entry. It's computed from the entry's own contents plus the seal of the entry before it.",
  },
  {
    term: "Chain",
    def: "The links between entries. Each entry's seal depends on the previous entry's seal, so entries can only be added to the end. Altering any past entry breaks every seal after it.",
  },
  {
    term: "Genesis",
    def: "The starting value the first entry links to. It's all zeros, because there's nothing before it.",
  },
  {
    term: "Append-only",
    def: "You can add entries but never edit or delete them. This is a deliberate constraint: if entries could be changed, the proof would be worthless.",
  },
  {
    term: "Attestation",
    def: "A confirmation from a third party that a specific entry happened as described. It becomes its own sealed entry in the chain.",
  },
  {
    term: "Anchoring",
    def: "Submitting your chain's latest seal to the Bitcoin blockchain, which proves the chain existed at that point in time against infrastructure nobody controls.",
  },
  {
    term: "OpenTimestamps",
    def: "The free, open protocol Beleg uses to anchor seals to Bitcoin. Anyone can verify an OpenTimestamps proof with open-source tools.",
  },
  {
    term: "Proof page",
    def: "The public link you share. Anyone who opens it can verify your entire chain in their own browser.",
  },
  {
    term: "Canonicalization",
    def: "Converting an entry to one exact text format before hashing, so the same entry always produces the same seal regardless of where it's read from.",
  },
];

export default function GlossaryPage() {
  return (
    <main className="page">
      <div className="page-inner doc doc-narrow">
        <header className="doc-header">
          <p className="doc-eyebrow">Reference</p>
          <h1 className="h1 doc-title">Glossary</h1>
          <p className="doc-lead">
            Every term Beleg uses, in plain English.
          </p>
        </header>

        <div className="card doc-body">
          <dl className="glossary-list">
            {TERMS.map((item) => (
              <div key={item.term} className="glossary-item">
                <dt className="glossary-term">{item.term}</dt>
                <dd className="glossary-def">{item.def}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <Footer />
    </main>
  );
}
