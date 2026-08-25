import type { Metadata } from "next";

import { Footer } from "@/app/components/Footer";
import { LegalDeck, type LegalSection } from "@/app/components/LegalDeck";

export const metadata: Metadata = {
  title: "Security · Beleg",
  description:
    "What Beleg protects, what it stores, where it runs, and the threats it explicitly does not defend against.",
};

const SECTIONS: LegalSection[] = [
  {
    heading: "What the chain actually defends",
    cards: [
      {
        id: "hash",
        icon: "hash",
        title: "Silent edits",
        body: "SHA-256 seals, each linked to the one before it.",
        more: "Change a past line and every seal after it fails. Anyone can recompute that in their own browser. They do not have to take our word.",
      },
      {
        id: "verify",
        icon: "globe",
        title: "A badge from our server",
        body: "Verify is local math. We do not issue the result.",
        more: "The public page walks the chain in the reviewer's browser. If Beleg disappeared, the same check would still work from the published JSON.",
      },
      {
        id: "time",
        icon: "clock",
        title: "Backdating",
        body: "Anchored chains are dated on Bitcoin with OpenTimestamps.",
        more: "That proves the newest seal existed at a calendar time nobody at Beleg controls. It does not prove the story in the entry is true.",
      },
      {
        id: "witness",
        icon: "stamp",
        title: "A fake confirmation after the fact",
        body: "A witness is its own sealed entry, chained in sequence.",
        more: "You cannot slide a name onto an old line without breaking the seals that follow.",
      },
    ],
  },
  {
    heading: "Where it runs",
    cards: [
      {
        id: "store",
        icon: "db",
        title: "What we store",
        body: "Account, ledger text, witness details, and anchor proofs.",
        more: "Email and name come from Clerk. Full inventory is on the privacy page.",
        href: { label: "Open the privacy cards", url: "/privacy" },
      },
      {
        id: "where",
        icon: "server",
        title: "Vendors",
        body: "Postgres in the US, Clerk, Vercel, OpenTimestamps calendars.",
        more: "Row-level rules are on. Reads and writes go through server routes, not a public database key in the browser.",
      },
      {
        id: "report",
        icon: "bug",
        title: "Report a problem",
        body: "beleg.app@proton.me. Beta. Responsible disclosure is welcome.",
        more: "If you find a way to rewrite a chain, break verify, or read someone else's private ledger, write that address.",
        href: {
          label: "Email beleg.app@proton.me",
          url: "mailto:beleg.app@proton.me",
        },
      },
    ],
  },
  {
    heading: "Outside the threat model",
    cards: [
      {
        id: "lie",
        icon: "alert",
        title: "A lie on day one",
        body: "Recording a false claim is still a false claim.",
        more: "Beleg proves integrity and timing. Honesty is on the writer and the witnesses.",
      },
      {
        id: "false-witness",
        icon: "user",
        title: "A witness who is wrong",
        body: "Their name is sealed. Their memory is not audited.",
        more: "A confirmation is evidence that a person said yes, not that the world matched the sentence.",
      },
      {
        id: "creds",
        icon: "key",
        title: "Stolen login",
        body: "If someone has your account, they can add new entries.",
        more: "They still cannot quietly rewrite the old ones. Lock the account and write us if that happens.",
      },
    ],
  },
];

export default function SecurityPage() {
  return (
    <main className="landing lp ip">
      <LegalDeck
        kicker="Security"
        title="What the chain stops, and what it never claimed to stop."
        lead="Integrity and timing, recomputed in the reviewer's browser. Click a card. This is not a promise that the story is true."
        updated="Threat model for the beta"
        sections={SECTIONS}
      />
      <Footer />
    </main>
  );
}
