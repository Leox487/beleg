import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

import AnimateIn from "@/app/components/AnimateIn";
import { CtaBadge } from "@/app/components/CtaBadge";
import { Footer } from "@/app/components/Footer";
import { HeroProofMock } from "@/app/components/HeroProofMock";
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
  const ctaLabel = signedIn ? "Go to your ledger" : "Start your ledger";

  return (
    <main className="landing">
      {/* ——— product-first hero ——— */}
      <section className="stage">
        <div className="stage-grid">
          <div className="stage-copy">
            <AnimateIn direction="up" delay={0}>
              <p className="stage-eyebrow">Beleg</p>

              <h1 className="brand-tagline">
                Proof and trust built into{" "}
                <span className="headline-accent">your timeline</span>.
              </h1>

              <p className="subline">
                Applications and pitches are drowning in AI-polished claims
                nobody can check. Beleg gives your traction a sealed record —
                written as it happens, confirmed by real people, and verifiable
                by anyone.
              </p>
            </AnimateIn>

            <AnimateIn direction="up" delay={70}>
              <div className="hero-actions">
                <Link className="cta" href={ctaHref}>
                  <span className="cta-label">{ctaLabel}</span>
                  <CtaBadge />
                </Link>
                <Link className="ghost-link" href="/how-it-works">
                  See how it works →
                </Link>
              </div>

              <p className="cta-note">
                Free while in beta. No credit card. About a minute to start.
              </p>

              <ul className="trust-strip" aria-label="Why people trust Beleg">
                <li>
                  <span className="trust-dot" aria-hidden="true" />
                  Free in beta
                </li>
                <li>
                  <span className="trust-dot" aria-hidden="true" />
                  Verifiable in your browser
                </li>
                <li>
                  <span className="trust-dot" aria-hidden="true" />
                  Anchored to Bitcoin
                </li>
              </ul>
            </AnimateIn>
          </div>

          <AnimateIn direction="up" delay={140} className="stage-visual">
            <HeroProofMock />
          </AnimateIn>
        </div>
      </section>

      {/* ——— human voices ——— */}
      <section className="land-section voices-section">
        <AnimateIn direction="up" delay={0}>
          <p className="section-eyebrow">What it feels like</p>
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
                <div className="voice-card testimonial-card">
                  <p className="voice-quote">&ldquo;{v.quote}&rdquo;</p>
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
      </section>

      {/* ——— how it works ——— */}
      <section className="strip-section land-band">
        <div className="land-band-inner">
          <AnimateIn direction="up">
            <p className="section-eyebrow">How it works</p>
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
              <Link className="ghost-link ghost-link-accent" href="/how-it-works">
                See the cryptography in detail →
              </Link>
            </p>
          </AnimateIn>
        </div>
      </section>

      {/* ——— peace of mind as bento ——— */}
      <section className="land-section pillar-band">
        <AnimateIn direction="up">
          <p className="section-eyebrow">Peace of mind</p>
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
                <div className="pillar-card peace-card">
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
              <div className="pillar-card peace-card metric-card">
                <p className="metric-value mono">SHA-256</p>
                <p className="metric-label">
                  the standard your browser already uses
                </p>
              </div>
            </AnimateIn>
          </li>

          <li className="bento-metric">
            <AnimateIn direction="up" delay={280}>
              <div className="pillar-card peace-card metric-card">
                <p className="metric-value mono">0</p>
                <p className="metric-label">
                  entries that can be edited after recording
                </p>
              </div>
            </AnimateIn>
          </li>
        </ul>
      </section>

      {/* ——— closing CTA ——— */}
      <section className="land-section land-cta land-band">
        <div className="land-band-inner land-cta-inner">
          <AnimateIn direction="up">
            <p className="section-eyebrow">Get started</p>
            <h2 className="section-heading">Start sealing what you ship.</h2>
            <p className="section-lead">
              Free while in beta. No credit card. Your first entry takes about a
              minute — and from then on, the chain speaks for itself.
            </p>
            <div className="hero-actions">
              <Link className="cta" href={ctaHref}>
                <span className="cta-label">{ctaLabel}</span>
                <CtaBadge />
              </Link>
            </div>
          </AnimateIn>
        </div>
      </section>

      <Footer />
    </main>
  );
}
