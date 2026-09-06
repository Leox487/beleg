import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

import { DEFAULT_DESCRIPTION } from "@/lib/site";
import { TOOL_GROUPS } from "@/lib/tools";

import { ChainField } from "@/app/components/ChainField";
import { CtaBadge } from "@/app/components/CtaBadge";
import { Footer } from "@/app/components/Footer";
import { HeroProofMock } from "@/app/components/HeroProofMock";

export const metadata: Metadata = {
  title: "Beleg. Proof, not prose.",
  description: DEFAULT_DESCRIPTION,
};

const FLOW = [
  {
    n: "01",
    title: "Record",
    text: "Each milestone is hashed and linked to the one before it. There is no edit button.",
  },
  {
    n: "02",
    title: "Witness",
    text: "Someone who was there confirms in one click. They do not need a Beleg account.",
  },
  {
    n: "03",
    title: "Verify",
    text: "The public page recomputes every seal in the reviewer’s browser. We do not issue the badge.",
  },
  {
    n: "04",
    title: "Timestamp",
    text: "Pending proofs are dated on Bitcoin with OpenTimestamps.",
  },
];

const WHO = [
  "Founders",
  "Grant applicants",
  "Freelancers",
  "Researchers",
  "Students",
  "Consultants",
];

const TOOLS = TOOL_GROUPS.slice(0, 2).flatMap((group) => group.links);

function LandingActions({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <div className="lp-actions">
      <Link className="lp-btn lp-btn-primary" href={href}>
        <span>{label}</span>
        <CtaBadge />
      </Link>
      <Link className="lp-btn lp-btn-ghost" href="/#how">
        See how it works
      </Link>
    </div>
  );
}

export default async function Home() {
  const { userId } = await auth();
  const signedIn = Boolean(userId);
  const ctaHref = signedIn ? "/dashboard" : "/sign-up";
  const startLabel = signedIn ? "Go to your ledger" : "Get started";

  return (
    <main className="landing lp">
      <section className="lp-hero lp-face-inter">
        <ChainField />
        <div className="lp-shell lp-hero-grid">
          <div className="lp-hero-copy">
            <p className="lp-kicker">Append-only · anchored to Bitcoin</p>
            <h1 className="lp-h1">A sealed timeline anyone can verify.</h1>
            <p className="lp-lead">
              Record a grant, a ship, a signed pilot. Someone who was there
              confirms it. A reviewer checks the chain in their own browser.
            </p>
            <LandingActions href={ctaHref} label={startLabel} />
          </div>
          <div className="lp-hero-visual">
            <HeroProofMock />
          </div>
        </div>
      </section>

      <section id="how" className="lp-section lp-face-inter">
        <div className="lp-shell">
          <h2 className="lp-h2">How it works</h2>
          <ol className="home-flow">
            {FLOW.map((item) => (
              <li key={item.title} className="home-flow-item">
                <span className="home-flow-n">{item.n}</span>
                <h3 className="home-flow-title">{item.title}</h3>
                <p className="home-flow-text">{item.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="uses" className="lp-section lp-face-inter">
        <div className="lp-shell">
          <h2 className="lp-h2">Who uses Beleg</h2>
          <p className="home-section-lead">
            People who have to show work and do not already have a public
            registry to point to.
          </p>
          <ul className="home-who">
            {WHO.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        </div>
      </section>

      <section id="tools" className="lp-section lp-face-inter">
        <div className="lp-shell">
          <h2 className="lp-h2">Tools</h2>
          <ul className="home-tools">
            {TOOLS.map((tool) => (
              <li key={tool.href}>
                <Link href={tool.href} className="home-tool">
                  <strong>{tool.label}</strong>
                  <span>{tool.text}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="lp-outlink">
            <Link href="/tools">All tools →</Link>
          </p>
        </div>
      </section>

      <section id="about" className="lp-section lp-face-inter">
        <div className="lp-shell">
          <h2 className="lp-h2">About</h2>
          <p className="home-section-lead">
            Beleg is German for proof, or receipt. Applications all sound
            finished now. This is a place for dates and confirmations that
            cannot be edited later.
          </p>
          <div className="lp-honest">
            <div className="lp-honest-col">
              <p className="lp-honest-label">What it holds</p>
              <p className="lp-body">
                The words you recorded, the order, the dates, who confirmed an
                entry, and when that confirmation was sealed.
              </p>
            </div>
            <div className="lp-honest-col">
              <p className="lp-honest-label">What it does not</p>
              <p className="lp-body">
                Whether the work was good. Whether a witness is telling the
                truth about the world. The chain only stops anyone, including
                you, from rewriting the history later.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-section lp-cta lp-face-inter">
        <div className="lp-shell lp-cta-inner">
          <h2 className="lp-h2 lp-cta-title">
            Start a ledger. Share the link when someone asks you to prove it.
          </h2>
          <LandingActions href={ctaHref} label={startLabel} />
        </div>
      </section>

      <Footer />
    </main>
  );
}
