import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

import { Footer } from "@/app/components/Footer";
import { Reveal } from "@/app/components/Reveal";

const HOW_IT_WORKS = [
  {
    step: "01",
    label: "Record.",
    text: "Add a milestone — the system seals it with a cryptographic timestamp.",
  },
  {
    step: "02",
    label: "Witness.",
    text: "Send a one-click link to whoever was there. Their confirmation is sealed into the same chain.",
  },
  {
    step: "03",
    label: "Share.",
    text: "Send anyone your public proof page. They verify the chain independently — in their own browser.",
  },
];

const OFFERINGS = [
  {
    title: "Sealed entries",
    text: "Every milestone you add is hashed and linked to the one before it. Editing, deleting, or reordering anything would break every seal after it — so the past stays as you recorded it.",
  },
  {
    title: "Third-party witnesses",
    text: "Invite the person who was there — a grant officer, a mentor, a co-founder — with one link. Their confirmation is sealed into the same chain, with the same protection.",
  },
  {
    title: "Public proof page",
    text: "One shareable URL. Anyone evaluating you can open it, hit Verify, and check the whole ledger in their own browser — without trusting Beleg or trusting you.",
  },
  {
    title: "Bitcoin anchoring",
    text: "Your chain tip is periodically timestamped against the Bitcoin blockchain via OpenTimestamps. Even if Beleg disappeared, the .ots proof would still stand.",
  },
];

const WHO_FOR = [
  {
    title: "Grant applicants",
    text: "Show reviewers a sealed record of milestones — not another AI-polished essay about them.",
  },
  {
    title: "Founders raising",
    text: "Hand investors a timeline they can verify independently, with witnesses attached to the claims that matter.",
  },
  {
    title: "Accelerator cohorts",
    text: "Prove what you shipped and when — with mentors and partners who can confirm it in one click.",
  },
];

function StepVisual({ step }: { step: string }) {
  if (step === "01") {
    return (
      <div className="viz viz-record" aria-hidden="true">
        <div className="viz-entry">
          <div className="viz-entry-top">
            <span className="viz-seq">#07</span>
            <span className="viz-kind">grant</span>
          </div>
          <span className="viz-title">
            <span className="viz-title-text">Grant received — $12,000</span>
            <span className="viz-caret" />
          </span>
          <span className="viz-detail">Civic Innovation Fund · Mar 12</span>
          <span className="viz-sealed">
            <span className="viz-sealed-dot" />
            Sealed
          </span>
        </div>
        <div className="viz-hash">
          <span className="viz-lock">⛓</span>
          <span className="viz-hash-text">a3f81c…d0e29b</span>
        </div>
      </div>
    );
  }

  if (step === "02") {
    return (
      <div className="viz viz-witness" aria-hidden="true">
        <div className="viz-ref">
          <span className="viz-ref-label">Confirming</span>
          <span className="viz-ref-title">Grant received — $12,000</span>
        </div>
        <div className="viz-person viz-person-a">
          <span className="viz-avatar viz-avatar-org">CIF</span>
          <div className="viz-person-meta">
            <span className="viz-person-name">Maya Chen</span>
            <span className="viz-person-role">Program Officer, Civic Innovation Fund</span>
          </div>
          <span className="viz-status">
            <span className="viz-pending">◐</span>
            <span className="viz-check">✓</span>
          </span>
        </div>
        <div className="viz-quote">
          &ldquo;We awarded this grant on March 12.&rdquo;
        </div>
      </div>
    );
  }

  return (
    <div className="viz viz-share" aria-hidden="true">
      <div className="viz-proof-url">beleg.app/p/northstar</div>
      <div className="viz-verified">
        <span className="viz-check-lg">✓</span>
        Chain verified · 7 entries
      </div>
      <div className="viz-links">
        <span className="viz-node" />
        <span className="viz-line" />
        <span className="viz-node" />
        <span className="viz-line" />
        <span className="viz-node" />
      </div>
    </div>
  );
}

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
      {/* ——— full-screen brand hero ——— */}
      <section className="stage">
        <div className="stage-inner">
          <h1 className="brand-mark">Beleg</h1>

          <p className="brand-tagline">
            <span className="headline-ink">Proof,</span>{" "}
            <span className="headline-accent">not prose.</span>
          </p>

          <p className="subline">
            Applications, pitches, and grant essays are drowning in AI-polished
            claims reviewers can&apos;t verify. Beleg gives your traction a
            cryptographically sealed timeline — recorded as it happens,
            witnessed by real people, and provable to anyone reading.
          </p>

          <div className="hero-actions">
            <Link className="cta" href={ctaHref}>
              {ctaLabel}
            </Link>
          </div>

          <p className="cta-note">
            Free while in beta. No credit card. 60 seconds to start.
          </p>
        </div>

        <span className="scroll-cue" aria-hidden="true" />
      </section>

      {/* ——— how it works ——— */}
      <section className="strip-section">
        <Reveal className="reveal-fade">
          <p className="section-eyebrow mono">How it works</p>
          <h2 className="section-heading">
            Record it. Get it witnessed. Share the proof.
          </h2>
        </Reveal>

        <Reveal className="reveal-stagger">
          <ul className="how-strip">
            {HOW_IT_WORKS.map((item) => (
              <li key={item.label} className="how-item">
                <span className="how-step mono">{item.step}</span>
                <span className="how-label">{item.label}</span>
                <span className="how-text">{item.text}</span>
                <StepVisual step={item.step} />
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="reveal-fade">
          <p className="landing-fine">
            Anchored to Bitcoin. Verifiable without trusting this website.
          </p>
        </Reveal>
      </section>

      {/* ——— the problem ——— */}
      <section className="land-section">
        <Reveal className="reveal-fade">
          <p className="section-eyebrow mono">The problem</p>
          <h2 className="section-heading">
            When every essay sounds perfect, persuasion stops working.
          </h2>
          <p className="section-lead">
            Grant reviewers, investors, and program officers are drowning in
            claims that were polished by the same models. Traction is easy to
            invent and hard to check. Beleg flips that: you record milestones as
            they happen, seal them so they can&apos;t be rewritten, and let
            witnesses confirm what they saw.
          </p>
        </Reveal>
      </section>

      {/* ——— what you get ——— */}
      <section className="land-section">
        <Reveal className="reveal-fade">
          <p className="section-eyebrow mono">What Beleg offers</p>
          <h2 className="section-heading">
            Four things that make a claim checkable.
          </h2>
        </Reveal>

        <Reveal className="reveal-stagger">
          <ul className="offer-grid">
            {OFFERINGS.map((item) => (
              <li key={item.title} className="offer-card">
                <h3 className="offer-title">{item.title}</h3>
                <p className="offer-text">{item.text}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* ——— scenario walkthrough ——— */}
      <section className="land-section">
        <Reveal className="reveal-fade">
          <p className="section-eyebrow mono">A real scenario</p>
          <h2 className="section-heading">
            From grant award to verifiable proof.
          </h2>
          <p className="section-lead">
            Same story the cards above animate — written out so you can see how
            the pieces connect.
          </p>
        </Reveal>

        <Reveal className="reveal-stagger">
          <ol className="scenario-steps">
            <li className="scenario-step">
              <span className="scenario-num mono">01</span>
              <div>
                <h3 className="scenario-title">You record the grant</h3>
                <p className="scenario-text">
                  &ldquo;Grant received — $12,000 from the Civic Innovation
                  Fund.&rdquo; Beleg seals it with a timestamp and chains it to
                  your previous entry. That sentence is now permanent.
                </p>
              </div>
            </li>
            <li className="scenario-step">
              <span className="scenario-num mono">02</span>
              <div>
                <h3 className="scenario-title">
                  The fund confirms it happened
                </h3>
                <p className="scenario-text">
                  You send Maya Chen, Program Officer at the Civic Innovation
                  Fund, a one-click link. She confirms: &ldquo;We awarded this
                  grant on March 12.&rdquo; Her attestation is sealed into the
                  same chain — not a private email you could forge later.
                </p>
              </div>
            </li>
            <li className="scenario-step">
              <span className="scenario-num mono">03</span>
              <div>
                <h3 className="scenario-title">
                  A reviewer verifies it themselves
                </h3>
                <p className="scenario-text">
                  Next time you apply somewhere, you share your public proof
                  page. The reviewer hits Verify. Their browser recomputes every
                  hash. Green means the grant entry and Maya&apos;s confirmation
                  are intact — without trusting Beleg&apos;s servers.
                </p>
              </div>
            </li>
          </ol>
        </Reveal>
      </section>

      {/* ——— who it's for ——— */}
      <section className="land-section">
        <Reveal className="reveal-fade">
          <p className="section-eyebrow mono">Who it&apos;s for</p>
          <h2 className="section-heading">
            Built for people who get asked to prove traction.
          </h2>
        </Reveal>

        <Reveal className="reveal-stagger">
          <ul className="who-grid">
            {WHO_FOR.map((item) => (
              <li key={item.title} className="who-card">
                <h3 className="who-title">{item.title}</h3>
                <p className="who-text">{item.text}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* ——— closing CTA ——— */}
      <section className="land-section land-cta">
        <Reveal className="reveal-fade">
          <h2 className="section-heading">Start sealing what you ship.</h2>
          <p className="section-lead">
            Free while in beta. No credit card. Your first entry takes about a
            minute — and from then on, the chain speaks for itself.
          </p>
          <div className="hero-actions">
            <Link className="cta" href={ctaHref}>
              {ctaLabel}
            </Link>
            <Link className="btn btn-secondary" href="/how-it-works">
              How the cryptography works
            </Link>
          </div>
        </Reveal>
      </section>

      <Footer />
    </main>
  );
}
