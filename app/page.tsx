import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

import { CtaBadge } from "@/app/components/CtaBadge";
import { Footer } from "@/app/components/Footer";
import { HeroProofMock } from "@/app/components/HeroProofMock";
import {
  StageSeal,
  StageVerify,
  StageWitness,
} from "@/app/components/HomeStages";
import { Showcase } from "@/app/components/Showcase";

const FLOW = [
  {
    title: "Record",
    text: "Each milestone is hashed and linked to the one before it. There is no edit button.",
  },
  {
    title: "Witness",
    text: "Someone who was there confirms in one click. They do not need a Beleg account.",
  },
  {
    title: "Verify",
    text: "The public page recomputes every seal in the reviewer’s browser. We do not issue the badge.",
  },
  {
    title: "Timestamp",
    text: "Pending proofs are dated on Bitcoin with OpenTimestamps.",
  },
];

const CASES = [
  {
    who: "Grant applicant",
    text: "Seal the award the day the email arrives. The program officer confirms it. A reviewer sees both on one public page.",
    art: "grant" as const,
  },
  {
    who: "Solo founder",
    text: "Ships, first revenue, pilots — recorded when they happened, not reconstructed for a pitch deck.",
    art: "founder" as const,
  },
  {
    who: "Work under NDA",
    text: "Prove an engagement existed, for whom, and when. The client confirms. The confidential spec never leaves their side.",
    art: "nda" as const,
  },
];

const REVIEW_STEPS = [
  {
    n: "01",
    title: "Open the public page",
    text: "A timeline: sequence, dates, titles, who confirmed what. No login.",
  },
  {
    n: "02",
    title: "Run Verify in the browser",
    text: "Intact means the hashes still match. Broken names the first entry that does not.",
  },
  {
    n: "03",
    title: "Read the witnesses",
    text: "Confirmations are entries on the same chain — a name and a statement, sealed after the fact.",
  },
  {
    n: "04",
    title: "Compare it to the application",
    text: "Dates and amounts should line up. Beleg does not grade the project. It shows the trail.",
  },
];

function SegArt({ kind }: { kind: "grant" | "founder" | "nda" }) {
  if (kind === "grant") {
    return (
      <div className="lp-art lp-art-grant" aria-hidden="true">
        <span className="lp-art-line">
          <i />
          <b>Grant · $12,000</b>
          <em>SEAL</em>
        </span>
        <span className="lp-art-line">
          <i />
          <b>Maya Chen, Civic Fund</b>
          <em>OK</em>
        </span>
        <span className="lp-art-line">
          <i />
          <b>beleg.app/p/northstar</b>
          <em>LIVE</em>
        </span>
      </div>
    );
  }
  if (kind === "founder") {
    return (
      <div className="lp-art lp-art-chain" aria-hidden="true">
        <span>
          <i />
          #01 ship
        </span>
        <span>
          <i />
          #02 first revenue
        </span>
        <span>
          <i />
          #03 pilot
        </span>
      </div>
    );
  }
  return (
    <div className="lp-art lp-art-nda" aria-hidden="true">
      <span>Acme Corp · Q3 engagement</span>
      <span className="lp-art-redact">confidential specification.pdf</span>
      <span className="lp-art-seal">SEAL 9c2a…f1 · client confirmed</span>
    </div>
  );
}

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
      <Link className="lp-btn lp-btn-ghost" href="/how-it-works">
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
        <div className="lp-hero-wash" aria-hidden="true" />
        <div className="lp-shell lp-hero-grid">
          <div className="lp-hero-copy">
            <p className="lp-kicker">Append-only · anchored to Bitcoin</p>
            <h1 className="lp-h1">
              A sealed timeline of traction anyone can verify.
            </h1>
            <p className="lp-lead">
              Record a grant, a ship, a signed pilot. Someone who was there can
              confirm it. A reviewer opens the public page and checks the chain
              in their own browser.
            </p>
            <LandingActions href={ctaHref} label={startLabel} />
          </div>
          <div className="lp-hero-visual">
            <HeroProofMock />
          </div>
        </div>

        <ol className="lp-shell lp-flow">
          {FLOW.map((item) => (
            <li key={item.title} className="lp-flow-item">
              <span className="lp-flow-node" aria-hidden="true" />
              <h2 className="lp-flow-title">{item.title}</h2>
              <p className="lp-flow-text">{item.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="lp-section lp-face-jakarta">
        <div className="lp-shell">
          <p className="lp-eyebrow">From the day it happened</p>
          <h2 className="lp-h2">
            One $12,000 grant, sealed, confirmed, and shared as a public link.
          </h2>
          <Showcase />
          <p className="lp-outlink">
            <Link href="/how-it-works">See the cryptography in detail →</Link>
          </p>
        </div>
      </section>

      <section className="lp-section lp-face-grotesk">
        <div className="lp-shell">
          <p className="lp-eyebrow">How a check actually works</p>
          <h2 className="lp-h2">
            Three things a reviewer can inspect without taking your word for it.
          </h2>
          <div className="lp-features">
            <article className="lp-feature">
              <div className="lp-feature-copy">
                <p className="lp-feature-kicker">01 · Record</p>
                <h3 className="lp-feature-title">
                  Each entry is hashed and linked to the one before it.
                </h3>
                <p className="lp-body">
                  Title, detail, date, and a SHA-256 fingerprint of that payload
                  plus the previous seal. Change anything later and every seal
                  after it no longer matches.
                </p>
              </div>
              <div className="lp-feature-stage">
                <StageSeal />
              </div>
            </article>
            <article className="lp-feature lp-feature-flip">
              <div className="lp-feature-copy">
                <p className="lp-feature-kicker">02 · Witness</p>
                <h3 className="lp-feature-title">
                  A person who was there can confirm it, without an account.
                </h3>
                <p className="lp-body">
                  Their name and statement become a new sealed entry on the same
                  chain — not a screenshot in a slide. If they never confirm, the
                  original record still stands.
                </p>
              </div>
              <div className="lp-feature-stage">
                <StageWitness />
              </div>
            </article>
            <article className="lp-feature">
              <div className="lp-feature-copy">
                <p className="lp-feature-kicker">03 · Verify</p>
                <h3 className="lp-feature-title">
                  The check runs on the reviewer’s machine.
                </h3>
                <p className="lp-body">
                  Verify does not call a Beleg API for a badge. It walks the
                  chain locally. Intact or broken is a math result. If Beleg
                  disappeared, the same check would still work from the published
                  JSON.
                </p>
              </div>
              <div className="lp-feature-stage">
                <StageVerify />
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="lp-section lp-light lp-face-jakarta">
        <div className="lp-light-grid" aria-hidden="true" />
        <span className="lp-light-scan" aria-hidden="true" />
        <div className="lp-shell lp-wide">
          <div className="lp-light-head">
            <p className="lp-eyebrow">Who it is for</p>
            <h2 className="lp-h2">
              Three situations where a paper trail does not already exist.
            </h2>
          </div>
          <ul className="lp-cases">
            {CASES.map((c) => (
              <li key={c.who} className="lp-case">
                <SegArt kind={c.art} />
                <h3 className="lp-case-who">{c.who}</h3>
                <p className="lp-body">{c.text}</p>
              </li>
            ))}
          </ul>
          <p className="lp-outlink lp-seg-foot">
            <Link href="/uses">More situations Beleg is built for →</Link>
          </p>
        </div>
      </section>

      <section className="lp-section lp-face-inter">
        <div className="lp-shell">
          <p className="lp-eyebrow">For reviewers</p>
          <h2 className="lp-h2">
            Grant officers and accelerators checking traction.
          </h2>
          <ol className="lp-steps">
            {REVIEW_STEPS.map((step) => (
              <li key={step.n} className="lp-step">
                <span className="lp-step-n">{step.n}</span>
                <h3 className="lp-step-title">{step.title}</h3>
                <p className="lp-body">{step.text}</p>
              </li>
            ))}
          </ol>
          <p className="lp-outlink">
            <Link href="/for-reviewers">Learn how reviewers use Beleg →</Link>
          </p>
        </div>
      </section>

      <section className="lp-section lp-light lp-face-grotesk">
        <div className="lp-light-grid" aria-hidden="true" />
        <span className="lp-light-scan" aria-hidden="true" />
        <div className="lp-shell lp-wide">
          <div className="lp-light-head">
            <p className="lp-eyebrow">Limits</p>
            <h2 className="lp-h2">
              What the chain proves, and what it does not.
            </h2>
          </div>
          <div className="lp-honest">
            <div className="lp-honest-col">
              <div className="lp-art lp-art-nodes lp-art-ok" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </div>
              <p className="lp-honest-label">Sealed</p>
              <ul>
                <li>The order of entries</li>
                <li>The words and dates you recorded</li>
                <li>The SHA-256 seals and previous-hash links</li>
                <li>Who confirmed an entry, and when that confirmation was sealed</li>
              </ul>
            </div>
            <div className="lp-honest-col">
              <div className="lp-art lp-art-nodes lp-art-no" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </div>
              <p className="lp-honest-label">Not claimed</p>
              <ul>
                <li>That the work was good, or the grant deserved</li>
                <li>That a witness is telling the truth about the world</li>
                <li>That Beleg has audited your company</li>
                <li>That a missing confirmation means the event did not happen</li>
              </ul>
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
