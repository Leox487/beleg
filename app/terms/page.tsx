import type { Metadata } from "next";

import { Footer } from "@/app/components/Footer";
import { LegalDeck, type LegalSection } from "@/app/components/LegalDeck";

export const metadata: Metadata = {
  title: "Terms of Service · Beleg",
  description:
    "The terms you agree to when using Beleg, including what the ledger does and does not prove.",
};

const SECTIONS: LegalSection[] = [
  {
    heading: "Using Beleg",
    cards: [
      {
        id: "age",
        icon: "age",
        title: "Age",
        body: "13 or older. Under 18 needs a parent or guardian.",
        more: "If you are under 13, do not create an account. If you are 13 to 17, you are saying a parent or guardian said yes.",
      },
      {
        id: "what",
        icon: "tool",
        title: "What this is",
        body: "An append-only ledger of milestones. Not a notary. Not a bank.",
        more: "Beleg is not a legal document system, a notary, a financial product, or a stand-in for a lawyer, accountant, or auditor.",
      },
      {
        id: "duty",
        icon: "duty",
        title: "Your responsibilities",
        body: "Record what happened. Do not fake a witness or someone else's identity.",
        more: "Do not use Beleg for fraud, threats, illegal content, or other people's personal data without their consent. You own the accuracy of what you type.",
      },
    ],
  },
  {
    heading: "What a sealed line is worth",
    cards: [
      {
        id: "proves",
        icon: "truth",
        title: "What it proves",
        body: "The words were recorded then, and have not been rewritten.",
        more: "A sealed entry saying you signed a $50K contract proves you wrote that sentence on that date. It does not prove the contract exists.",
      },
      {
        id: "not",
        icon: "alert",
        title: "What it does not prove",
        body: "Truth, quality, or that a missing witness means it never happened.",
        more: "A named person confirmed a statement. That is not the same as the statement being true. Bitcoin dating proves the chain existed, not that the contents are accurate. Do not call this a certified document or an audit.",
      },
      {
        id: "attest",
        icon: "stamp",
        title: "Witnesses",
        body: "You are asking a real person to put their name on a public record.",
        more: "Do not invent attesters. Do not request a confirmation from someone who did not agree. Confirmations cannot be pulled back. They should only confirm what they know.",
      },
      {
        id: "append",
        icon: "chain",
        title: "Append-only",
        body: "No edit. No delete of a single line. Think before you seal.",
        more: "If you need the whole account gone, email us. We delete within 30 days. A correction is a new entry. The original stays.",
      },
    ],
  },
  {
    heading: "The service",
    cards: [
      {
        id: "beta",
        icon: "cloud",
        title: "Availability",
        body: "Beta. Bugs, downtime, and breaking changes are possible.",
        more: "No uptime promise, no SLA, no warranty. Use it knowing that.",
      },
      {
        id: "liability",
        icon: "shield",
        title: "Liability",
        body: "Provided as-is. We are not on the hook for decisions you make from it.",
        more: "That includes disputes over a witness statement, lost data, and interruptions. Do not treat a Beleg page as legal proof.",
      },
      {
        id: "stop",
        icon: "ban",
        title: "Termination",
        body: "We can close accounts used for fraud. You can leave any time.",
        more: "Ask for a full delete and we will do it within 30 days.",
      },
      {
        id: "changes",
        icon: "clock",
        title: "Changes",
        body: "We may update these terms. Using the app after that is acceptance.",
        more: "The date at the top of this page is the live version.",
      },
      {
        id: "contact",
        icon: "mail",
        title: "Contact",
        body: "beleg.app@proton.me",
        more: "That is the address for terms, deletion, and anything else.",
        href: {
          label: "Write beleg.app@proton.me",
          url: "mailto:beleg.app@proton.me",
        },
      },
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="landing lp ip">
      <LegalDeck
        kicker="Terms"
        title="The rules for sealing a line, and for reading one."
        lead="By using Beleg you agree to these terms. If you disagree, do not use the service. Click a card for the rest of the sentence."
        updated="Last updated August 18, 2026"
        sections={SECTIONS}
      />
      <Footer />
    </main>
  );
}
