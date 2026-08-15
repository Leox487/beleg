import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

import AnimateIn from "@/app/components/AnimateIn";
import { ChainField } from "@/app/components/ChainField";
import { CtaBadge } from "@/app/components/CtaBadge";
import { Footer } from "@/app/components/Footer";
import { Showcase } from "@/app/components/Showcase";

const PILLARS = [
  {
    title: "Your past, sealed.",
    text: "Every milestone you add is hashed and linked to the one before it. Editing, deleting, or reordering anything would break every seal after it — so the past stays as you recorded it.",
    flagship: true,
  },
  {
    title: "Witnessed by someone who was there.",
    text: "A grant officer, a mentor, a client — whoever actually saw it happen can confirm an entry without creating an account. Their word becomes part of the record, not a screenshot you pasted in.",
    flagship: false,
  },
  {
    title: "Checked by anyone, anywhere.",
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
  },
  {
    quote:
      "I don't have a co-founder to vouch for me. The chain is the thing that remembers when I shipped.",
    who: "Solo founder",
    context: "Indie SaaS, pre-seed",
  },
  {
    quote:
      "Half my best work is under NDA. The client confirms the engagement — I don't have to show the code.",
    who: "Freelance developer",
    context: "Payments integration for a SaaS client",
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
      <section className="section-full stage land-hero-prove spotlight spotlight-hero">
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

      {/* ——— human voices ——— */}
      <section className="section-full land-section voices-section">
        <div className="section-full-inner">
          <AnimateIn direction="up" delay={0}>
            <p className="section-eyebrow">What it feels like</p>
            <hr className="rule-fade-bright eyebrow-rule" />
            <h2 className="section-heading">
              Finally — a way to show what happened without hoping they believe
              you.
            </h2>
            <p className="section-lead">
              The voices Beleg is built for — not polished reviews, just the
              situations people keep running into.
            </p>
          </AnimateIn>

          <ul className="voice-grid">
            {VOICES.map((v, i) => (
              <li key={v.who}>
                <AnimateIn direction="up" delay={i * 70}>
                  <div className="voice-card testimonial-card card-gradient">
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
      <section className="section-full strip-section land-band spotlight spotlight-center">
        <div className="land-band-inner section-full-inner">
          <AnimateIn direction="up">
            <p className="section-eyebrow">How it works</p>
            <hr className="rule-fade-bright eyebrow-rule" />
            <h2 className="section-heading">
              Record it. Get it witnessed. Share the proof.
            </h2>
            <p className="section-lead">
              Hover a step to watch it happen — one $12,000 grant, followed from
              the day it landed to the link a reviewer can check.
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
      <section className="section-full land-section pillar-band">
        <div className="section-full-inner">
          <AnimateIn direction="up">
            <p className="section-eyebrow">Peace of mind</p>
            <hr className="rule-fade-bright eyebrow-rule" />
            <h2 className="section-heading">
              More clarity. Less asking people to take your word for it.
            </h2>
          </AnimateIn>

          <ul className="bento">
            {PILLARS.map((item, i) => (
              <li
                key={item.title}
                className={item.flagship ? "bento-flagship" : "bento-tile"}
              >
                <AnimateIn direction="up" delay={i * 70}>
                  <div className="pillar-card peace-card card-gradient">
                    {item.flagship ? (
                      <div className="bento-mini" aria-hidden="true">
                        <div className="bento-mini-chain">
                          <span className="bento-mini-row">
                            <span className="bento-mini-seq">#01</span>
                            <span className="bento-mini-hash">
                              a3f81c94b7d0e29b…
                            </span>
                          </span>
                          <span className="bento-mini-row">
                            <span className="bento-mini-seq">#02</span>
                            <span className="bento-mini-hash">
                              7b02e9f3314fc118…
                            </span>
                          </span>
                          <span className="bento-mini-row">
                            <span className="bento-mini-seq">#03</span>
                            <span className="bento-mini-hash">
                              c14d6a2e8099e07f…
                            </span>
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="bento-seal" aria-hidden="true">
                        ✓
                      </span>
                    )}
                    <h3 className="pillar-title">{item.title}</h3>
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
      <section className="section-full land-section land-cta land-band spotlight spotlight-cta">
        <div className="land-band-inner land-cta-inner section-full-inner">
          <AnimateIn direction="up">
            <p className="section-eyebrow">Get started</p>
            <hr className="rule-fade-bright eyebrow-rule" />
            <h2 className="section-heading">Start sealing what you ship.</h2>
            <p className="section-lead">
              Free while in beta. No credit card. Your first entry takes about a
              minute — and from then on, the chain speaks for itself.
            </p>
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
      <section className="section-full land-section land-reviewers">
        <div className="section-full-inner land-reviewers-inner">
          <AnimateIn direction="up">
            <span className="land-reviewers-badge">FOR EVALUATORS</span>
            <h2 className="section-heading land-reviewers-title">
              Stop guessing. Start verifying.
            </h2>
            <p className="section-lead land-reviewers-lead">
              Reviewing applications? Ask founders for their Beleg link. One
              click runs a cryptographic check in your own browser — no server,
              no trust, no blind faith.
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
