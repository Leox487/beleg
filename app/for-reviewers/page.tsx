import type { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/app/components/Footer";
import { USE_CASES } from "@/lib/use-cases";

export const metadata: Metadata = {
  title: "For Reviewers · Beleg",
  description:
    "Ask founders for their Beleg link. Verify a sealed timeline in your browser in about two seconds. No account, no trust required.",
};

const STEPS = [
  {
    n: "01",
    title: "Ask for the link",
    text: "In the application, email, or intro call, ask the founder for their Beleg proof URL. It looks like belegapp.com/p/their-venture.",
  },
  {
    n: "02",
    title: "Click Verify",
    text: "Open the page and run verification in your own browser. The check is local cryptography, not a badge Beleg issues from a server.",
  },
  {
    n: "03",
    title: "Green checkmarks = proof",
    text: "Intact seals mean the timeline hasn’t been edited, deleted, or reordered since each entry was recorded. Witnesses and Bitcoin anchors show up on the same page.",
  },
];

export default function ForReviewersPage() {
  return (
    <main className="page">
      <div className="page-inner doc doc-wide">
        <header className="doc-header">
          <h1 className="h1 doc-title">
            For Reviewers: Verify in 2 Seconds
          </h1>
          <p className="lead">
            Grant officers, accelerator screens, angel investors, and anyone
            else who has to evaluate traction without living inside the
            founder&apos;s inbox. Beleg gives you a shareable record you can
            check yourself.
          </p>
        </header>

        <div className="card doc-body">
          <h2>Three steps</h2>
          <ol className="reviewer-steps">
            {STEPS.map((step) => (
              <li key={step.n} className="reviewer-step">
                <span className="reviewer-step-n mono">{step.n}</span>
                <div>
                  <h3 className="reviewer-step-title">{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <p>
            Ready to try it?{" "}
            <Link href="/verify">Open the verify tool</Link> or ask any founder
            for their public proof page.
          </p>
        </div>

        <section className="uses-index reviewer-professions">
          <h2 className="h2">Who you&apos;ll see using Beleg</h2>
          <p className="small uses-index-help">
            The same {USE_CASES.length} professions from{" "}
            <Link href="/uses">Who it&apos;s for</Link>: founders and builders
            who need to prove work that doesn&apos;t leave an official paper
            trail.
          </p>
          <ul className="reviewer-profession-list">
            {USE_CASES.map((item) => (
              <li key={item.id}>{item.label}</li>
            ))}
          </ul>
        </section>
      </div>

      <Footer />
    </main>
  );
}
