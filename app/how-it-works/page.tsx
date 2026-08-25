import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

import ChainLab from "@/app/components/ChainLab";
import { CtaBadge } from "@/app/components/CtaBadge";
import { Footer } from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "How Beleg Works · Beleg",
  description:
    "Hash chains, in-browser verification, witness confirmations, and Bitcoin timestamps, in plain English.",
};

const FACTS = [
  {
    id: "record",
    title: "Record",
    text: "Each entry is hashed and linked to the one before it. There is no edit button.",
  },
  {
    id: "witness",
    title: "Witness",
    text: "Someone who was there confirms in one click. They do not need an account.",
  },
  {
    id: "verify",
    title: "Verify",
    text: "The public page recomputes every seal in the reviewer’s browser.",
  },
  {
    id: "timestamp",
    title: "Timestamp",
    text: "The newest seal is dated on Bitcoin with OpenTimestamps.",
  },
];

export default async function HowItWorksPage() {
  const { userId } = await auth();
  const signedIn = Boolean(userId);
  const ctaHref = signedIn ? "/dashboard" : "/sign-up";
  const ctaLabel = signedIn ? "Go to your ledger" : "Start a ledger";

  return (
    <main className="landing lp ip">
      <section className="lp-hero ip-hero lp-face-playfair">
        <div className="lp-hero-wash" aria-hidden="true" />
        <div className="lp-shell ip-anchor" id="try">
          <p className="lp-kicker">How it works</p>
          <h1 className="lp-h1 ip-h1">A chain you can break on this page.</h1>
          <p className="lp-lead">
            These are real SHA-256 seals, computed in your browser. Change one
            character in entry #1 and every seal after it fails.
          </p>
          <div className="ip-lab">
            <ChainLab />
          </div>
        </div>
      </section>

      <section className="lp-section ip-section lp-face-lab">
        <div className="lp-shell">
          <ol className="ip-facts">
            {FACTS.map((fact) => (
              <li key={fact.id} className="ip-anchor" id={fact.id}>
                <h2>{fact.title}</h2>
                <p>{fact.text}</p>
              </li>
            ))}
          </ol>
          <p className="lp-body ip-note ip-anchor" id="limits">
            A sealed line proves when you wrote it, and that it has not changed.
            It does not prove the event is true. Witnesses and evidence do that.
          </p>
        </div>
      </section>

      <section className="lp-section lp-cta lp-face-news">
        <div className="lp-shell lp-cta-inner">
          <h2 className="lp-h2 lp-cta-title">
            Record one milestone. Share the link when someone asks.
          </h2>
          <div className="lp-actions">
            <Link className="lp-btn lp-btn-primary" href={ctaHref}>
              <span>{ctaLabel}</span>
              <CtaBadge />
            </Link>
            <Link className="lp-btn lp-btn-ghost" href="/uses">
              See who it is for
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
