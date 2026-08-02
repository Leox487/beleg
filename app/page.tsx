import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

import AnimateIn from "@/app/components/AnimateIn";
import { CtaBadge } from "@/app/components/CtaBadge";
import { Footer } from "@/app/components/Footer";
import { Showcase } from "@/app/components/Showcase";
import { UseExplorer } from "@/app/components/UseExplorer";

const PILLARS = [
  {
    title: "Your past, sealed.",
    text: "Every milestone you add is hashed and linked to the one before it. Editing, deleting, or reordering anything would break every seal after it — so the past stays as you recorded it.",
  },
  {
    title: "Witnessed by someone who was there.",
    text: "Invite the person who saw it happen — a grant officer, a mentor, a client — with one link. Their confirmation is sealed into the same chain, with the same protection.",
  },
  {
    title: "Checked by anyone, anywhere.",
    text: "One shareable URL. Anyone evaluating you can open it, hit Verify, and check the whole ledger in their own browser — without trusting Beleg or trusting you.",
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
      {/* ——— centered human hero ——— */}
      <section className="stage">
        <div className="hero-glow" aria-hidden="true" />

        <div className="stage-inner">
          <AnimateIn direction="up" delay={0}>
            <p className="stage-eyebrow">Beleg</p>

            <h1 className="brand-tagline">
              <span className="headline-accent">Proof</span> and{" "}
              <span className="headline-accent">trust</span> built into your
              timeline.
            </h1>

            <p className="subline">
              Applications and pitches are drowning in AI-polished claims nobody
              can check. Beleg gives your traction a sealed record — written as
              it happens, confirmed by real people, and verifiable by anyone.
            </p>
          </AnimateIn>

          <AnimateIn direction="up" delay={150}>
            <div className="hero-actions">
              <Link className="cta" href={ctaHref}>
                <span className="cta-label">{ctaLabel}</span>
                <CtaBadge />
              </Link>
            </div>

            <p className="cta-note">
              Free while in beta. No credit card. About a minute to start.
            </p>
          </AnimateIn>
        </div>

        <AnimateIn direction="up" delay={250}>
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
      </section>

      {/* ——— human voices ——— */}
      <section className="land-section voices-section">
        <AnimateIn direction="up" delay={0}>
          <p className="section-eyebrow">What it feels like</p>
          <h2 className="section-heading section-heading-center">
            Finally — a way to show what happened without hoping they believe
            you.
          </h2>
          <p className="section-lead section-lead-center">
            The voices Beleg is built for — not polished reviews, just the
            situations people keep running into.
          </p>
        </AnimateIn>

        <ul className="voice-grid">
          {VOICES.map((v, i) => (
            <li key={v.who}>
              <AnimateIn direction="up" delay={i * 120}>
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
      <section className="strip-section">
        <AnimateIn direction="up">
          <p className="section-eyebrow">How it works</p>
          <h2 className="section-heading">
            Record it. Get it witnessed. Share the proof.
          </h2>
          <p className="section-lead">
            Hover a step to watch it happen — the same grant, followed all the
            way through.
          </p>
        </AnimateIn>

        <Showcase />
      </section>

      {/* ——— pillars on a calm dark band ——— */}
      <section className="pillar-band">
        <div className="pillar-band-inner">
          <AnimateIn direction="up">
            <p className="section-eyebrow pillar-eyebrow">Peace of mind</p>
            <h2 className="section-heading pillar-heading">
              More clarity. Less asking people to take your word for it.
            </h2>
          </AnimateIn>

          <ul className="pillar-grid">
            {PILLARS.map((item, i) => (
              <li key={item.title}>
                <AnimateIn direction="up" delay={i * 120}>
                  <div className="pillar-card peace-card">
                    <h3 className="pillar-title">{item.title}</h3>
                    <p className="pillar-text">{item.text}</p>
                  </div>
                </AnimateIn>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ——— split human scenario ——— */}
      <section className="land-section">
        <AnimateIn direction="up">
          <p className="section-eyebrow">A real scenario</p>
          <h2 className="section-heading">
            From grant award to something a stranger can check.
          </h2>
        </AnimateIn>

        <AnimateIn direction="up" delay={120}>
          <div className="split-card">
            <div className="split-visual" aria-hidden="true">
              <div className="split-scene">
                <span className="split-scene-label">Public proof page</span>
                <div className="split-scene-entry">
                  <span className="split-scene-seq">#4</span>
                  <div>
                    <p className="split-scene-title">Grant received — $12,000</p>
                    <p className="split-scene-detail">
                      Civic Innovation Fund · confirmed by Maya Chen
                    </p>
                  </div>
                </div>
                <div className="split-scene-verify">
                  <span className="split-scene-check">✓</span>
                  Chain verified · 7 entries intact
                </div>
              </div>
            </div>
            <div className="split-copy">
              <h3 className="split-title">
                Take control of the story you&apos;re asked to prove.
              </h3>
              <p className="split-text">
                You record the grant the day it lands. Maya Chen, the program
                officer, confirms it with one click. Next time a reviewer asks,
                you send one link — and their browser checks the seals
                themselves.
              </p>
              <ol className="split-steps">
                <li>
                  <strong>You record it</strong> — sealed with a timestamp.
                </li>
                <li>
                  <strong>Someone who was there confirms</strong> — sealed into
                  the same chain.
                </li>
                <li>
                  <strong>Anyone can verify</strong> — without trusting this
                  website.
                </li>
              </ol>
            </div>
          </div>
        </AnimateIn>
      </section>

      {/* ——— who it's for ——— */}
      <section className="land-section land-panel">
        <AnimateIn direction="up">
          <p className="section-eyebrow">Who it&apos;s for</p>
          <h2 className="section-heading">
            If someone can ask you to prove it, you can use Beleg.
          </h2>
          <p className="section-lead">
            Founders, small business owners, contractors, freelancers,
            researchers, students, consultants — anyone whose best work is real
            but invisible to the stranger evaluating them.
          </p>
        </AnimateIn>

        <AnimateIn direction="up" delay={100}>
          <UseExplorer />
        </AnimateIn>
      </section>

      {/* ——— closing CTA ——— */}
      <section className="land-section land-cta">
        <AnimateIn direction="up">
          <p className="section-eyebrow">Get started</p>
          <h2 className="section-heading">Start sealing what you ship.</h2>
          <p className="section-lead">
            Free while in beta. No credit card. Your first entry takes about a
            minute — and from then on, the chain speaks for itself.
          </p>
          <div className="hero-actions">
            <Link className="cta cta-invert" href={ctaHref}>
              <span className="cta-label">{ctaLabel}</span>
              <CtaBadge />
            </Link>
            <Link className="ghost-link" href="/how-it-works">
              How the cryptography works
            </Link>
          </div>
        </AnimateIn>
      </section>

      <Footer />
    </main>
  );
}
