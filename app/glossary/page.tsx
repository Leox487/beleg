import type { Metadata } from "next";

import { Footer } from "@/app/components/Footer";
import { LegalDeck, type LegalSection } from "@/app/components/LegalDeck";

export const metadata: Metadata = {
  title: "Glossary · Beleg",
  description:
    "Plain-English definitions for every term Beleg uses: hash, seal, chain, anchoring, and more.",
};

const SECTIONS: LegalSection[] = [
  {
    heading: "The chain",
    cards: [
      {
        id: "hash",
        icon: "hash",
        title: "Hash",
        body: "A fingerprint. Same input, same output. One changed character, a new fingerprint.",
        more: "Beleg uses SHA-256, a public standard your browser already implements. Nobody at Beleg has a special version.",
      },
      {
        id: "seal",
        icon: "stamp",
        title: "Seal",
        body: "The hash attached to an entry: its contents plus the seal before it.",
        more: "That link is why a past edit shows up. The new seal will not match what the next entry expected.",
      },
      {
        id: "chain",
        icon: "chain",
        title: "Chain",
        body: "Each seal depends on the previous one. You can only add at the end.",
        more: "Alter any past entry and every seal after it breaks. That is the whole mechanism.",
      },
      {
        id: "genesis",
        icon: "file",
        title: "Genesis",
        body: "The starting value the first entry links to. All zeros.",
        more: "There is nothing before entry one, so the previous seal is a string of zeros.",
      },
    ],
  },
  {
    heading: "How people use it",
    cards: [
      {
        id: "append",
        icon: "archive",
        title: "Append-only",
        body: "Add entries. Never edit or delete one. Otherwise the proof is theater.",
        more: "A mistake gets a new line that corrects it. The original stays visible.",
      },
      {
        id: "attest",
        icon: "user",
        title: "Attestation",
        body: "A third party confirms an entry. That confirmation is sealed too.",
        more: "It becomes its own entry on the same chain, with a name and a statement.",
      },
      {
        id: "anchor",
        icon: "clock",
        title: "Anchoring",
        body: "The latest seal goes to Bitcoin, so the date does not depend on us.",
        more: "Infrastructure nobody at Beleg controls. The calendars see a hash, not your grant title.",
      },
      {
        id: "ots",
        icon: "globe",
        title: "OpenTimestamps",
        body: "The open protocol used to date a seal on Bitcoin.",
        more: "Anyone can check an OpenTimestamps proof with open-source tools if Beleg is gone.",
      },
      {
        id: "page",
        icon: "share",
        title: "Proof page",
        body: "The public link you share. The visitor verifies in their own browser.",
        more: "We do not issue a badge from a server. Their machine walks the seals.",
      },
      {
        id: "canon",
        icon: "file",
        title: "Canonicalization",
        body: "One exact text form before hashing, so the seal does not drift.",
        more: "The same entry hashed in two places has to produce the same digest. The wire format is strict on purpose.",
      },
    ],
  },
];

export default function GlossaryPage() {
  return (
    <main className="landing lp ip">
      <LegalDeck
        kicker="Glossary"
        title="Every term, in the language a reviewer already has."
        lead="Click a card. These are not marketing words. They are the pieces of the check."
        updated="Reference"
        sections={SECTIONS}
      />
      <Footer />
    </main>
  );
}
