import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

import { CtaBadge } from "@/app/components/CtaBadge";
import { Footer } from "@/app/components/Footer";
import { UseExplorer } from "@/app/components/UseExplorer";
import { CATEGORIES, USE_CASES, useCasesByCategory } from "@/lib/use-cases";

export const metadata: Metadata = {
  title: "Who Beleg is for",
  description:
    "Founders, contractors, freelancers, researchers, students, and consultants. Pick a profession and see the first entry you would seal, who confirms it, and where the link goes.",
};

export default async function UsesPage() {
  const { userId } = await auth();
  const signedIn = Boolean(userId);
  const grouped = useCasesByCategory();
  const ctaHref = signedIn ? "/dashboard" : "/sign-up";
  const ctaLabel = signedIn ? "Go to your ledger" : "Start a ledger";

  return (
    <main className="landing lp ip">
      <section className="lp-hero ip-hero">
        <div className="lp-hero-wash" aria-hidden="true" />
        <div className="lp-shell">
          <p className="lp-kicker">Who it is for</p>
          <h1 className="lp-h1 ip-h1">
            Work a stranger has to take on trust.
          </h1>
          <p className="lp-lead">
            Pick a profession. You will see the first entry you would seal, who
            confirms it, and where the public link actually goes.{" "}
            {USE_CASES.length} cases where that is useful, and a short list of
            where it is not.
          </p>
        </div>
      </section>

      <section className="lp-section ip-section">
        <div className="lp-shell ip-shell-wide">
          <UseExplorer />
        </div>
      </section>

      <section className="lp-section ip-section">
        <div className="lp-shell">
          <p className="lp-eyebrow">The rest of the list</p>
          <h2 className="lp-h2">
            If someone asks you to prove a thing happened, this is the pattern.
          </h2>
          <p className="lp-body ip-intro">
            Record it when it happens. Ask the person who was there to confirm
            it. Share one link. If that is your problem, Beleg works whether or
            not your job title is below.
          </p>
        </div>
        <div className="lp-shell ip-shell-wide">
          <div className="ip-index">
            {CATEGORIES.map((category) => (
              <div key={category} className="ip-index-col">
                <p className="ip-index-cat">{category}</p>
                <ul className="ip-index-list">
                  {(grouped.get(category) ?? []).map((item) => (
                    <li key={item.id}>
                      <a href={`#${item.id}`}>{item.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-section lp-light">
        <div className="lp-light-grid" aria-hidden="true" />
        <span className="lp-light-scan" aria-hidden="true" />
        <div className="lp-shell lp-wide">
          <div className="lp-light-head">
            <p className="lp-eyebrow">Where it does not help</p>
            <h2 className="lp-h2">
              If an official record already answers the question, use that.
            </h2>
          </div>
          <ul className="ip-limits">
            <li>
              <strong>Licensed trades and clinicians.</strong>
              State boards verify electricians, plumbers, CPAs, attorneys, and
              therapists. A licence lookup beats a self-recorded entry saying
              you renewed yours.
            </li>
            <li>
              <strong>Anything already in a public register.</strong>
              Court filings, building permits, health inspection scores, property
              sales, municipal contract awards.
            </li>
            <li>
              <strong>Audience numbers on public platforms.</strong>
              Subscriber and stream counts are visible to anyone. Sealing a
              number the sponsor can read off the page adds nothing.
            </li>
            <li>
              <strong>Audited financials.</strong>
              A lender wants tax returns and bank statements. A ledger entry can
              sit next to that picture. It does not replace it.
            </li>
            <li>
              <strong>Confidential client outcomes.</strong>
              Where privilege or clinical ethics govern the relationship, asking
              a client to confirm in public is the wrong move, however useful
              the confirmation would be.
            </li>
          </ul>
          <p className="lp-body ip-limits-close">
            What is left is work that is real, confirmable by someone who was
            there, and otherwise invisible to a stranger. That gap is what Beleg
            is for.
          </p>
        </div>
      </section>

      <section className="lp-section lp-cta">
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
