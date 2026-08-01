import type { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/app/components/Footer";
import { UseExplorer } from "@/app/components/UseExplorer";
import { CATEGORIES, USE_CASES, useCasesByCategory } from "@/lib/use-cases";

export const metadata: Metadata = {
  title: "Who Beleg is for",
  description:
    "Founders, small business owners, contractors, freelancers, researchers, students, and consultants. Pick your profession and see exactly how a sealed ledger applies to your work — and where it doesn't help.",
};

export default function UsesPage() {
  const grouped = useCasesByCategory();

  return (
    <main className="page">
      <div className="page-inner doc doc-wide">
        <header className="doc-header">
          <h1 className="h1 doc-title">Who Beleg is for</h1>
          <p className="lead">
            Anyone whose best work is real but invisible to the stranger
            evaluating them. This is a short list on purpose —{" "}
            {USE_CASES.length} cases where a sealed ledger genuinely beats the
            alternatives, and an honest note about where it doesn&apos;t.
          </p>
        </header>

        <UseExplorer />

        <section className="uses-index">
          <h2 className="h2">Every profession, listed</h2>
          <p className="small uses-index-help">
            Don&apos;t see yours? The pattern is the same everywhere: record it
            when it happens, have the person who was there confirm it, share one
            link. If that describes a problem you have, Beleg works for you
            whether or not your job is on this list.
          </p>

          <div className="uses-index-grid">
            {CATEGORIES.map((category) => (
              <div key={category} className="uses-index-col">
                <p className="uses-index-cat mono">{category}</p>
                <ul className="uses-index-list">
                  {(grouped.get(category) ?? []).map((item) => (
                    <li key={item.id}>{item.label}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="uses-limits">
          <h2 className="h2">Where Beleg doesn&apos;t help</h2>
          <p className="uses-limits-lead">
            If an official record already answers the question, use the official
            record. Beleg is worse than all of these, and pretending otherwise
            would waste your time:
          </p>
          <ul className="uses-limits-list">
            <li>
              <strong>Licensed trades and clinicians.</strong> State boards
              verify electricians, plumbers, CPAs, attorneys, therapists, and
              dietitians. A licence lookup beats a self-recorded entry saying
              you renewed yours.
            </li>
            <li>
              <strong>Anything already in a public register.</strong> Court
              filings, building permits, planning approvals, health inspection
              scores, property sales, and municipal contract awards are public
              by law.
            </li>
            <li>
              <strong>Audience numbers on public platforms.</strong> Subscriber
              and stream counts are visible to anyone. Sealing a number the
              sponsor can read off the page adds nothing.
            </li>
            <li>
              <strong>Audited financials.</strong> A lender wants tax returns
              and bank statements. A ledger entry can support that picture, but
              it does not replace it.
            </li>
            <li>
              <strong>Confidential client outcomes.</strong> Where privilege or
              clinical ethics govern the relationship, asking a client to
              publicly attest is inappropriate, however useful it would be.
            </li>
          </ul>
          <p className="uses-limits-close">
            What&apos;s left is the gap those leave behind: work that is real,
            confirmable by someone who was there, and otherwise invisible to a
            stranger. That gap is what Beleg is for.
          </p>
        </section>

        <section className="uses-outro card">
          <h2 className="h3">Start with one entry</h2>
          <p>
            Whatever your work is, the first step is the same: record the most
            recent thing you&apos;d want someone to believe, and send the person
            who witnessed it a one-click confirmation link.
          </p>
          <Link className="cta" href="/sign-up">
            <span className="cta-label">Start your ledger</span>
            <span className="cta-badge" aria-hidden="true">
              <span className="cta-arrow">→</span>
            </span>
          </Link>
        </section>
      </div>

      <Footer />
    </main>
  );
}
