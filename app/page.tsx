import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

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

function StepVisual({ step }: { step: string }) {
  if (step === "01") {
    return (
      <div className="viz viz-record" aria-hidden="true">
        <div className="viz-entry">
          <span className="viz-seq">#12</span>
          <span className="viz-bar viz-bar-lg" />
          <span className="viz-bar viz-bar-sm" />
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
        <div className="viz-person viz-person-a">
          <span className="viz-avatar" />
          <span className="viz-bar viz-bar-md" />
          <span className="viz-status">
            <span className="viz-pending">◐</span>
            <span className="viz-check">✓</span>
          </span>
        </div>
        <div className="viz-person viz-person-b">
          <span className="viz-avatar" />
          <span className="viz-bar viz-bar-sm" />
          <span className="viz-status">
            <span className="viz-pending">◐</span>
            <span className="viz-check">✓</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="viz viz-share" aria-hidden="true">
      <div className="viz-verified">
        <span className="viz-check-lg">✓</span>
        Chain verified
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
            <Link className="cta" href={signedIn ? "/dashboard" : "/sign-up"}>
              {signedIn ? "Go to your ledger" : "Start your ledger"}
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
    </main>
  );
}
