import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

import { CtaBadge } from "@/app/components/CtaBadge";
import { Footer } from "@/app/components/Footer";
import { UseExplorer } from "@/app/components/UseExplorer";
import { USE_CASES } from "@/lib/use-cases";

export const metadata: Metadata = {
  title: "Who Beleg is for",
  description:
    "Founders, contractors, freelancers, researchers, students, and consultants. Pick a profession and see the first entry you would seal, who confirms it, and where the link goes.",
};

export default async function UsesPage() {
  const { userId } = await auth();
  const signedIn = Boolean(userId);
  const ctaHref = signedIn ? "/dashboard" : "/sign-up";
  const ctaLabel = signedIn ? "Go to your ledger" : "Start a ledger";

  return (
    <main className="landing lp ip">
      <section className="lp-hero ip-hero lp-face-fraunces">
        <div className="lp-hero-wash" aria-hidden="true" />
        <div className="lp-shell">
          <p className="lp-kicker">Who it is for</p>
          <h1 className="lp-h1 ip-h1">
            Work a stranger has to take on trust.
          </h1>
          <p className="lp-lead">
            Pick a profession. You will see the first entry you would seal, who
            confirms it, and where the public link goes. {USE_CASES.length}{" "}
            cases where that helps, and a short list of where it does not.
          </p>
          <UseExplorer />
        </div>
      </section>

      <section className="lp-section ip-section lp-face-playfair">
        <div className="lp-shell">
          <p className="lp-eyebrow">Where it does not help</p>
          <ul className="ip-quiet-list">
            <li>
              <strong>Licensed trades and clinicians.</strong> A state board
              lookup already answers the question.
            </li>
            <li>
              <strong>Public registers.</strong> Court filings, permits,
              inspection scores, property sales.
            </li>
            <li>
              <strong>Public audience numbers.</strong> Subscriber counts the
              sponsor can already read off the page.
            </li>
            <li>
              <strong>Audited financials.</strong> A lender wants tax returns
              and bank statements.
            </li>
            <li>
              <strong>Confidential client outcomes.</strong> Asking a client to
              confirm in public is often the wrong move.
            </li>
          </ul>
        </div>
      </section>

      <section className="lp-section lp-cta lp-face-news">
        <div className="lp-shell lp-cta-inner">
          <h2 className="lp-h2 lp-cta-title">
            Start with one entry. Send the witness link the same day.
          </h2>
          <div className="lp-actions">
            <Link className="lp-btn lp-btn-primary" href={ctaHref}>
              <span>{ctaLabel}</span>
              <CtaBadge />
            </Link>
            <Link className="lp-btn lp-btn-ghost" href="/how-it-works">
              See how the seals work
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
