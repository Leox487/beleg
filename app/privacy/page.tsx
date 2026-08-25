import type { Metadata } from "next";

import { Footer } from "@/app/components/Footer";
import { LegalDeck, type LegalSection } from "@/app/components/LegalDeck";

export const metadata: Metadata = {
  title: "Privacy Policy · Beleg",
  description:
    "What data Beleg collects, why, and how it is handled, in plain English.",
};

const SECTIONS: LegalSection[] = [
  {
    heading: "What we collect",
    cards: [
      {
        id: "account",
        icon: "user",
        title: "Account",
        body: "Email and name, through Clerk, when you sign up.",
        more: "That is the identity we attach to your ledgers. We do not ask for a phone number, a government ID, or a billing address.",
      },
      {
        id: "venture",
        icon: "file",
        title: "Venture data",
        body: "Names, titles, bodies, dates, and the seals you create.",
        more: "This is the product: an append-only chain of what you recorded. We store the words you typed and the hashes computed from them.",
      },
      {
        id: "attest",
        icon: "stamp",
        title: "Witness data",
        body: "Name, email, statement, and the time they confirmed.",
        more: "Witnesses do not create accounts. We keep only what they typed on the confirmation link. Pending requests never appear on the public page.",
      },
      {
        id: "anchor",
        icon: "hash",
        title: "Anchoring",
        body: "A hash of the chain, sent to OpenTimestamps. Not the entries.",
        more: "The fingerprint cannot be reversed into your text. Bitcoin calendars see a digest, not a grant title.",
      },
      {
        id: "usage",
        icon: "log",
        title: "Usage logs",
        body: "Page visits and errors, kept for debugging.",
        more: "No analytics trackers, advertising pixels, or third-party tracking scripts.",
      },
      {
        id: "not",
        icon: "ban",
        title: "What we do not take",
        body: "Payments, IDs, phone numbers, location, or your inbox.",
        more: "Email ingestion, if it ships, gets its own policy before launch. We do not collect payment information.",
      },
    ],
  },
  {
    heading: "How it is handled",
    cards: [
      {
        id: "store",
        icon: "server",
        title: "Where it lives",
        body: "Postgres in the US. Auth with Clerk. Hosting on Vercel.",
        more: "Data sits in a US-region database (us-west-1). Clerk handles sign-in. Both vendors publish their own security practices.",
      },
      {
        id: "public",
        icon: "globe",
        title: "Public proof pages",
        body: "Anyone with the URL can read what you chose to record.",
        more: "Name, tagline, titles, bodies, dates, seals, and confirmed witnesses. You pick the words and when to share the link. We do not index the page for you.",
      },
      {
        id: "keep",
        icon: "archive",
        title: "Retention",
        body: "Entries cannot be edited. A whole ledger can be deleted.",
        more: "Append-only is the product, not a bug. To erase a venture and the account, email beleg.app@proton.me. We delete within 30 days.",
        href: {
          label: "Email beleg.app@proton.me",
          url: "mailto:beleg.app@proton.me",
        },
      },
      {
        id: "rights",
        icon: "scale",
        title: "Your rights",
        body: "Access, correction, or deletion on request. 30 days.",
        more: "EU residents also have portability and the right to complain to a supervisory authority. Write beleg.app@proton.me.",
      },
    ],
  },
  {
    heading: "Vendors and other rules",
    cards: [
      {
        id: "vendors",
        icon: "share",
        title: "Third parties",
        body: "Clerk, the database host, Vercel, OpenTimestamps. Nobody else.",
        more: "We do not sell or rent the chain. OpenTimestamps receives a hash. Clerk receives the account. Vercel serves the app.",
      },
      {
        id: "cookies",
        icon: "cookie",
        title: "Cookies",
        body: "Session cookies for sign-in. Nothing for ads.",
        more: "Clerk sets what it needs to keep you logged in. No advertising, tracking, or analytics cookies.",
      },
      {
        id: "kids",
        icon: "child",
        title: "Children",
        body: "Not for anyone under 13. Do not create an account.",
        more: "If we learn an account belongs to a child under 13, we delete it.",
      },
      {
        id: "changes",
        icon: "clock",
        title: "Changes",
        body: "Updates land on this page with a new date.",
        more: "We do not bury material changes in the footer. The date at the top is the record.",
      },
      {
        id: "contact",
        icon: "mail",
        title: "Contact",
        body: "beleg.app@proton.me",
        more: "That address reaches a person in Philadelphia. Use it for deletion, access, or a privacy question.",
        href: {
          label: "Write beleg.app@proton.me",
          url: "mailto:beleg.app@proton.me",
        },
      },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="landing lp ip">
      <LegalDeck
        kicker="Privacy"
        title="What we hold, and what we never take."
        lead="Click a card. The short version is on the face. The rest opens underneath. Nothing here is sold, and nothing is tracked for ads."
        updated="Last updated August 18, 2026"
        sections={SECTIONS}
      />
      <Footer />
    </main>
  );
}
