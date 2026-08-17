import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

import { BelegMark } from "@/app/components/BelegMark";
import { ChainField } from "@/app/components/ChainField";
import { CtaBadge } from "@/app/components/CtaBadge";
import { Footer } from "@/app/components/Footer";
import {
  StageGrant,
  StageNda,
  StageSeal,
  StageSolo,
  StageStamp,
  StageVerify,
  StageWitness,
} from "@/app/components/HomeStages";
import { Showcase } from "@/app/components/Showcase";

const PILLARS = [
  {
    stage: "seal" as const,
    text: "Every milestone you add is hashed and linked to the one before it. Editing, deleting, or reordering anything would break every seal after it, so the past stays as you recorded it.",
    flagship: true,
  },
  {
    stage: "witness" as const,
    text: "A grant officer, a mentor, a client: whoever actually saw it happen can confirm an entry without creating an account. Their word becomes part of the record, not a screenshot you pasted in.",
    flagship: false,
  },
  {
    stage: "verify" as const,
    text: "Verification is math, not a badge we issue. A reviewer can confirm your record is intact without taking our word for it, or yours.",
    flagship: false,
  },
];

const VOICES = [
  {
    quote:
      "Reviewers kept asking me to prove the grant was real. Now I hand them a link and they check it themselves.",
    who: "Grant applicant",
    context: "Civic Innovation Fund award",
    stage: "grant" as const,
  },
  {
    quote:
      "I don't have a co-founder to vouch for me. The chain is the thing that remembers when I shipped.",
    who: "Solo founder",
    context: "Indie SaaS, pre-seed",
    stage: "solo" as const,
  },
  {
    quote:
      "Half my best work is under NDA. The client confirms the engagement. I don't have to show the code.",
    who: "Freelance developer",
    context: "Payments integration for a SaaS client",
    stage: "nda" as const,
  },
];

export default async function Home() {
  const { userId } = await auth();
  const signedIn = Boolean(userId);
  const ctaHref = signedIn ? "/dashboard" : "/sign-up";

  return (
    <main className="landing">
      <section className="section-full stage land-hero-prove spotlight spotlight-hero home-scene home-scene-prove">
        <ChainField />
        <div className="land-hero-prove-inner">
          <p className="land-hero-prove-brand">
            <BelegMark className="land-hero-prove-mark" />
            Beleg
          </p>
          <h1 className="land-hero-prove-title">Start proving traction</h1>
          <div className="land-hero-prove-actions">
            <Link className="cta" href={ctaHref}>
              <span className="cta-label">{signedIn ? "Go to your ledger" : "Start"}</span>
              <CtaBadge />
            </Link>
            <Link className="ghost-link land-hero-prove-ghost" href="/how-it-works">
              See how it works
            </Link>
          </div>
        </div>
      </section>

      <hr className="rule-fade land-rule land-rule-hero" />

      <section className="section-full land-section home-scene home-scene-prims">
        <div className="section-full-inner">
          <p className="home-kicker">
            A sealed timeline, a witness, and a check that runs in the
            reviewer&apos;s browser.
          </p>

          <ul className="home-prims">
            <li>
              <div className="home-prim-card card-gradient">
                <StageSeal />
                <p className="home-prim-text">
                  Every milestone is hashed and linked to the one before it.
                  Edit the past and every seal after it breaks.
                </p>
              </div>
            </li>
            <li>
              <div className="home-prim-card card-gradient">
                <StageWitness />
                <p className="home-prim-text">
                  A grant officer, mentor, or client confirms in one click, no
                  account. Their word becomes a sealed entry.
                </p>
              </div>
            </li>
            <li>
              <div className="home-prim-card card-gradient">
                <StageVerify />
                <p className="home-prim-text">
                  Verification is math, not a badge we issue. A reviewer
                  recomputes every seal locally.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <hr className="rule-fade land-rule" />

      <section className="section-full land-section voices-section home-scene home-scene-voices">
        <div className="section-full-inner">
          <p className="home-kicker">
            Grant applicants, solo founders, and work under NDA.
          </p>

          <ul className="voice-grid">
            {VOICES.map((v) => (
              <li key={v.who}>
                <div className="voice-card testimonial-card card-gradient">
                  {v.stage === "grant" ? (
                    <StageGrant />
                  ) : v.stage === "solo" ? (
                    <StageSolo />
                  ) : (
                    <StageNda />
                  )}
                  <p className="voice-quote">&ldquo;{v.quote}&rdquo;</p>
                  <hr className="rule-fade" />
                  <div className="voice-meta">
                    <span className="voice-avatar" aria-hidden="true">
                      {v.who.charAt(0)}
                    </span>
                    <div>
                      <p className="voice-who">{v.who}</p>
                      <p className="voice-context">{v.context}</p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <hr className="rule-fade land-rule" />

      <section className="section-full strip-section land-band spotlight spotlight-center home-scene home-scene-how">
        <div className="land-band-inner section-full-inner">
          <p className="home-kicker">
            One $12,000 grant, from the day it landed to a public link.
          </p>

          <Showcase />

          <p className="section-outlink">
            <Link className="ghost-link ghost-link-accent" href="/how-it-works">
              See the cryptography in detail
            </Link>
          </p>
        </div>
      </section>

      <hr className="rule-fade land-rule" />

      <section className="section-full land-section pillar-band home-scene home-scene-seals">
        <div className="section-full-inner">
          <p className="home-kicker">
            What cannot be edited: the order, the seals, and who confirmed them.
          </p>

          <ul className="bento">
            {PILLARS.map((item) => (
              <li
                key={item.stage}
                className={item.flagship ? "bento-flagship" : "bento-tile"}
              >
                <div className="pillar-card peace-card card-gradient">
                  {item.stage === "seal" ? (
                    <StageSeal />
                  ) : item.stage === "witness" ? (
                    <StageWitness />
                  ) : (
                    <StageVerify />
                  )}
                  <p className="pillar-text">{item.text}</p>
                </div>
              </li>
            ))}

            <li className="bento-metric">
              <div className="pillar-card peace-card metric-card card-gradient">
                <p className="metric-value mono">SHA-256</p>
                <p className="metric-label">
                  the standard your browser already uses
                </p>
              </div>
            </li>

            <li className="bento-metric">
              <div className="pillar-card peace-card metric-card card-gradient">
                <p className="metric-value mono">0</p>
                <p className="metric-label">
                  entries that can be edited after recording
                </p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <hr className="rule-fade land-rule" />

      <section className="section-full land-section land-cta land-band spotlight spotlight-cta home-scene home-scene-start">
        <div className="land-band-inner land-cta-inner section-full-inner">
          <StageStamp />
          <div className="hero-actions">
            <Link className="cta" href={ctaHref}>
              <span className="cta-label">{signedIn ? "Go to your ledger" : "Start"}</span>
              <CtaBadge />
            </Link>
          </div>
        </div>
      </section>

      <hr className="rule-fade land-rule" />

      <section className="section-full land-section land-reviewers home-scene home-scene-verify">
        <div className="section-full-inner land-reviewers-inner">
          <StageVerify />
          <p className="home-kicker home-kicker-center">
            For grant officers and accelerators checking traction.
          </p>
          <Link className="land-reviewers-link" href="/for-reviewers">
            Learn how reviewers use Beleg
            <svg
              className="land-reviewers-arrow"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
