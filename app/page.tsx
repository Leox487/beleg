import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

import AnimateIn from "@/app/components/AnimateIn";
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
    text: "Every milestone you add is hashed and linked to the one before it. Editing, deleting, or reordering anything would break every seal after it — so the past stays as you recorded it.",
    flagship: true,
  },
  {
    stage: "witness" as const,
    text: "A grant officer, a mentor, a client — whoever actually saw it happen can confirm an entry without creating an account. Their word becomes part of the record, not a screenshot you pasted in.",
    flagship: false,
  },
  {
    stage: "verify" as const,
    text: "Verification is math, not a badge we issue. A reviewer can confirm your record is intact without taking our word for it — or yours.",
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
      "Half my best work is under NDA. The client confirms the engagement — I don't have to show the code.",
    who: "Freelance developer",
    context: "Payments integration for a SaaS client",
    stage: "nda" as const,
  },
];

export default async function Home() {
  // Branch the CTA on auth state. A signed-in visitor sent to /sign-up gets
  // bounced back to / by Clerk (active session), which looked like the button
  // "just refreshing". Signed-in users go straight to the dashboard instead.
  const { userId } = await auth();
  const signedIn = Boolean(userId);
  const ctaHref = signedIn ? "/dashboard" : "/sign-up";
  const ctaLabel = signedIn
    ? "Go to your ledger →"
    : "Start Your Free Proof Timeline →";

  return (
    <main className="landing">
      {/* ——— Phase 1 hero ——— */}
      <section className="section-full stage land-hero-prove spotlight spotlight-hero home-scene home-scene-prove">
        <ChainField />
        <div className="land-hero-prove-inner">
          <AnimateIn direction="up" delay={0} duration={780}>
            <p className="stage-brand land-hero-prove-brand">Beleg</p>
            <h1 className="land-hero-prove-title">
              Stop claiming traction. <br />
              <span className="land-hero-prove-accent">Start proving it.</span>
            </h1>
            <p className="land-hero-prove-lead">
              Beleg creates a tamper-proof, publicly verifiable timeline of your
              startup&apos;s achievements. Share one link that replaces due
              diligence for grants, accelerators, and investors.
            </p>
          </AnimateIn>

          <AnimateIn direction="up" delay={100} duration={780}>
            <div className="land-hero-prove-actions">
              <Link className="cta" href={ctaHref}>
                <span className="cta-label">{ctaLabel}</span>
                <CtaBadge />
              </Link>
              <Link className="ghost-link land-hero-prove-ghost" href="/how-it-works">
                See how it works
              </Link>
            </div>
            <p className="land-hero-prove-note">
              ✓ Free in beta. No credit card. 2-minute setup.
            </p>
          </AnimateIn>
        </div>
      </section>

      <hr className="rule-fade land-rule land-rule-hero" />

      {/* ——— illustrated capabilities (unique scene per claim) ——— */}
      <section className="section-full land-section home-scene home-scene-prims">
        <div className="section-full-inner">
          <AnimateIn direction="up">
            <p className="home-kicker">
              A sealed timeline, a witness who was there, and a check that runs
              in the reviewer&apos;s browser — three things a reviewer can
              inspect without taking your word for it.
            </p>
          </AnimateIn>

          <ul className="home-prims">
            <li>
              <AnimateIn direction="up" delay={40}>
                <div className="home-prim-card card-gradient">
                  <StageSeal />
                  <p className="home-prim-text">
                    Every milestone is hashed and linked to the one before it.
                    Edit the past and every seal after it breaks.
                  </p>
                </div>
              </AnimateIn>
            </li>
            <li>
              <AnimateIn direction="up" delay={120}>
                <div className="home-prim-card card-gradient">
                  <StageWitness />
                  <p className="home-prim-text">
                    A grant officer, mentor, or client confirms in one click —
                    no account. Their word becomes a sealed entry.
                  </p>
                </div>
              </AnimateIn>
            </li>
            <li>
              <AnimateIn direction="up" delay={200}>
                <div className="home-prim-card card-gradient">
                  <StageVerify />
                  <p className="home-prim-text">
                    Verification is math, not a badge we issue. A reviewer
                    recomputes every seal locally.
                  </p>
                </div>
              </AnimateIn>
            </li>
          </ul>
        </div>
      </section>

      <hr className="rule-fade land-rule" />

      {/* ——— human voices ——— */}
      <section className="section-full land-section voices-section home-scene home-scene-voices">
        <div className="section-full-inner">
          <AnimateIn direction="up" delay={0}>
            <p className="home-kicker">
              Grant applicants, solo founders, and people whose best work sits
              under NDA — anyone who has to prove something that never leaves
              an official paper trail.
            </p>
          </AnimateIn>

          <ul className="voice-grid">
            {VOICES.map((v, i) => (
              <li key={v.who}>
                <AnimateIn
                  direction={i === 0 ? "left" : i === 2 ? "right" : "up"}
                  delay={i * 90}
                  distance={22}
                >
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
                </AnimateIn>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <hr className="rule-fade land-rule" />

      {/* ——— how it works ——— */}
      <section className="section-full strip-section land-band spotlight spotlight-center home-scene home-scene-how">
        <div className="land-band-inner section-full-inner">
          <AnimateIn direction="up">
            <p className="home-kicker">
              One $12,000 grant, from the day it landed to the public link a
              reviewer can check. Hover a step to watch that path.
            </p>
          </AnimateIn>

          <Showcase />

          <AnimateIn direction="up" delay={70}>
            <p className="section-outlink">
              <Link
                className="ghost-link ghost-link-accent"
                href="/how-it-works"
              >
                See the cryptography in detail →
              </Link>
            </p>
          </AnimateIn>
        </div>
      </section>

      <hr className="rule-fade land-rule" />

      {/* ——— peace of mind as bento ——— */}
      <section className="section-full land-section pillar-band home-scene home-scene-seals">
        <div className="section-full-inner">
          <AnimateIn direction="up">
            <p className="home-kicker">
              What cannot be edited after you record it: the order of entries,
              the seals, and who confirmed them.
            </p>
          </AnimateIn>

          <ul className="bento">
            {PILLARS.map((item, i) => (
              <li
                key={item.stage}
                className={item.flagship ? "bento-flagship" : "bento-tile"}
              >
                <AnimateIn direction="up" delay={i * 90} distance={18}>
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
                </AnimateIn>
              </li>
            ))}

            <li className="bento-metric">
              <AnimateIn direction="up" delay={210}>
                <div className="pillar-card peace-card metric-card card-gradient">
                  <p className="metric-value mono">SHA-256</p>
                  <p className="metric-label">
                    the standard your browser already uses
                  </p>
                </div>
              </AnimateIn>
            </li>

            <li className="bento-metric">
              <AnimateIn direction="up" delay={280}>
                <div className="pillar-card peace-card metric-card card-gradient">
                  <p className="metric-value mono">0</p>
                  <p className="metric-label">
                    entries that can be edited after recording
                  </p>
                </div>
              </AnimateIn>
            </li>
          </ul>
        </div>
      </section>

      <hr className="rule-fade land-rule" />

      {/* ——— closing CTA ——— */}
      <section className="section-full land-section land-cta land-band spotlight spotlight-cta home-scene home-scene-start">
        <div className="land-band-inner land-cta-inner section-full-inner">
          <AnimateIn direction="up">
            <p className="home-kicker">
              Free in beta. No credit card. The first entry takes about a
              minute.
            </p>
            <StageStamp />
            <div className="hero-actions">
              <Link className="cta" href={ctaHref}>
                <span className="cta-label">
                  {signedIn ? "Go to your ledger" : "Start your ledger"}
                </span>
                <CtaBadge />
              </Link>
            </div>
          </AnimateIn>
        </div>
      </section>

      <hr className="rule-fade land-rule" />

      {/* ——— For Reviewers ——— */}
      <section className="section-full land-section land-reviewers home-scene home-scene-verify">
        <div className="section-full-inner land-reviewers-inner">
          <AnimateIn direction="up">
            <StageVerify />
            <p className="home-kicker home-kicker-center">
              For grant officers, accelerators, and anyone who has to check
              traction without living in the founder&apos;s inbox.
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
          </AnimateIn>
        </div>
      </section>

      <Footer />
    </main>
  );
}
