import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

import { DEFAULT_DESCRIPTION, SITE_URL } from "@/lib/site";
import { TOOL_GROUPS } from "@/lib/tools";

import Accordion from "@/app/components/Accordion";
import ChainLab from "@/app/components/ChainLab";
import { CopyText } from "@/app/components/CopyText";
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
    text: "Hash each milestone and link it to the one before. There is no edit button.",
  },
  {
    n: "02",
    title: "Witness",
    text: "Someone who was there confirms in one click. They do not need an account.",
  },
  {
    n: "03",
    title: "Verify",
    text: "The public page recomputes every seal in the reviewer’s browser.",
  },
];

const WHO = [
  { label: "Founders", tag: "startups" },
  { label: "Grant applicants", tag: "funding" },
  { label: "Freelancers", tag: "clients" },
  { label: "Researchers", tag: "labs" },
  { label: "Students", tag: "portfolios" },
  { label: "Consultants", tag: "engagements" },
  { label: "Nonprofits", tag: "grants" },
  { label: "Indie hackers", tag: "ships" },
];

const TOOLS = TOOL_GROUPS.flatMap((group) => group.links);

const FAQS = [
  {
    q: "Can I edit or delete an entry?",
    a: "No, and that is the point. If you made a mistake, add a correction. The original stays, the chain stays intact.",
  },
  {
    q: "Does Beleg prove my claims are true?",
    a: "No. It proves when something was recorded and that it has not changed since. Truth comes from witnesses and evidence.",
  },
  {
    q: "Is this a blockchain product?",
    a: "Bitcoin is used for one thing: dating the ledger so its existence is provable without trusting us. No tokens, no wallets, no gas.",
  },
  {
    q: "What if Beleg shuts down?",
    a: "Anchored proofs are downloadable and verifiable with open-source tools against Bitcoin. No dependency on us surviving.",
  },
  {
    q: "Is it free?",
    a: "Yes, while in public beta. A seal is not a funding decision and not legal evidence.",
  },
];

function LandingActions({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <div className="home-actions">
      <Link className="lp-btn lp-btn-primary" href={href}>
        <span>{label}</span>
        <CtaBadge />
      </Link>
      <Link className="lp-btn lp-btn-ghost" href="/#try">
        Try it here
      </Link>
    </div>
  );
}

export default async function Home() {
  const { userId } = await auth();
  const signedIn = Boolean(userId);
  const ctaHref = signedIn ? "/dashboard" : "/sign-up";
  const startLabel = signedIn ? "Go to your ledger" : "Get started";
  const shareUrl = `${SITE_URL}/p/your-ledger`;

  return (
    <main className="landing lp home">
      <section className="home-hero">
        <div className="home-hero-wash" aria-hidden="true" />
        <div className="lp-shell home-hero-copy">
          <p className="home-live">Public beta · anchored to Bitcoin</p>
          <h1 className="home-h1">A sealed timeline anyone can verify.</h1>
          <p className="home-sub">
            Record what happened. Someone who was there confirms it. A reviewer
            checks the chain in their own browser.
          </p>
          <LandingActions href={ctaHref} label={startLabel} />
        </div>
        <div className="lp-shell home-hero-stage">
          <HeroProofMock />
        </div>
      </section>

      <section className="home-share">
        <div className="lp-shell home-share-inner">
          <p className="home-share-label">Give this to a reviewer</p>
          <CopyText value={shareUrl} />
          <p className="home-share-note">
            They open the public page and run Verify. Nothing is sent to us.
          </p>
        </div>
      </section>

      <section id="how" className="home-band">
        <div className="lp-shell">
          <p className="home-kicker">How it works</p>
          <h2 className="home-h2">Three things a reviewer can check.</h2>
          <ol className="home-ways">
            {FLOW.map((item) => (
              <li key={item.title}>
                <span>{item.n}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="try" className="home-band">
        <div className="lp-shell">
          <p className="home-kicker">Try it here</p>
          <h2 className="home-h2">Break the chain.</h2>
          <p className="home-lead">
            These are real SHA-256 seals, computed in this browser. Edit one
            character in entry #1 and every seal after it fails.
          </p>
          <ChainLab />
        </div>
      </section>

      <section id="uses" className="home-band">
        <div className="lp-shell">
          <p className="home-kicker">Who it&apos;s for</p>
          <h2 className="home-h2">Who uses Beleg</h2>
          <p className="home-lead">
            People who have to show work and do not already have a public
            registry to point to.
          </p>
          <ul className="home-chips">
            {WHO.map((item) => (
              <li key={item.label}>
                <strong>{item.label}</strong>
                <span>{item.tag}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="tools" className="home-band">
        <div className="lp-shell">
          <p className="home-kicker">Tools</p>
          <h2 className="home-h2">Run the check yourself.</h2>
          <ul className="home-catalog">
            {TOOLS.map((tool) => (
              <li key={tool.href}>
                <Link href={tool.href}>
                  <strong>{tool.label}</strong>
                  <span>{tool.kind}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="about" className="home-band">
        <div className="lp-shell home-about">
          <p className="home-kicker">About</p>
          <h2 className="home-h2">A record nobody can quietly rewrite.</h2>
          <p className="home-lead">
            Beleg is German for proof, or receipt. Applications all sound
            finished now. This is a place for dates and confirmations that
            cannot be edited later.
          </p>
          <div className="home-split">
            <div>
              <p className="home-split-label">What it holds</p>
              <p>
                The words you recorded, the order, the dates, who confirmed an
                entry, and when that confirmation was sealed.
              </p>
            </div>
            <div>
              <p className="home-split-label">What it does not</p>
              <p>
                Whether the work was good. Whether a witness is telling the
                truth. The chain only stops anyone, including you, from
                rewriting the history later.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="home-band">
        <div className="lp-shell home-faq">
          <p className="home-kicker">Questions</p>
          <h2 className="home-h2">Common questions.</h2>
          <div className="home-faq-list">
            {FAQS.map((item) => (
              <Accordion key={item.q} title={item.q}>
                <p>{item.a}</p>
              </Accordion>
            ))}
          </div>
        </div>
      </section>

      <section className="home-cta">
        <div className="lp-shell">
          <h2 className="home-h2">
            Start a ledger. Share the link when someone asks you to prove it.
          </h2>
          <LandingActions href={ctaHref} label={startLabel} />
        </div>
      </section>

      <Footer />
    </main>
  );
}
