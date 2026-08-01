import type { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/app/components/Footer";
import { UseExplorer } from "@/app/components/UseExplorer";
import { CATEGORIES, USE_CASES, useCasesByCategory } from "@/lib/use-cases";

export const metadata: Metadata = {
  title: "Who Beleg is for — every profession that needs proof",
  description:
    "Founders, small business owners, tradespeople, freelancers, students, clinicians, and creators. Pick your profession and see exactly how a sealed ledger applies to your work.",
};

export default function UsesPage() {
  const grouped = useCasesByCategory();

  return (
    <main className="page">
      <div className="page-inner doc doc-wide">
        <header className="doc-header">
          <h1 className="h1 doc-title">Who Beleg is for</h1>
          <p className="lead">
            Anyone whose track record lives in claims other people are supposed
            to take on faith. Below are {USE_CASES.length} professions and the
            exact way each one uses a sealed ledger — pick yours.
          </p>
        </header>

        <UseExplorer />

        <section className="uses-index">
          <h2 className="h2">Every profession, listed</h2>
          <p className="small uses-index-help">
            Don&apos;t see yours? The pattern is the same everywhere: record it
            when it happens, have the person who was there confirm it, share one
            link.
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
