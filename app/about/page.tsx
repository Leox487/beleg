import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

import { CtaBadge } from "@/app/components/CtaBadge";
import { Footer } from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "About · Beleg",
  description:
    "Why Beleg exists: applications all sound finished now. A reviewer needs dates and confirmations that cannot be quietly rewritten.",
};

function AboutScene() {
  return (
    <div className="ip-contrast" aria-hidden="true">
      <div className="ip-contrast-col">
        <p className="ip-contrast-label">The essay</p>
        <p className="ip-contrast-line is-rewrite">
          <span>We have strong traction this quarter</span>
          <span>Revenue is growing rapidly</span>
        </p>
        <p className="ip-contrast-line is-dim">Clear path to product-market fit</p>
        <p className="ip-contrast-line is-dim">Experienced team executing well</p>
      </div>
      <div className="ip-contrast-col is-chain">
        <p className="ip-contrast-label">The ledger</p>
        <p className="ip-contrast-row">
          <i />
          <b>#01 First customer signed</b>
          <em>SEAL</em>
        </p>
        <p className="ip-contrast-row">
          <i />
          <b>#02 Confirmed by ops lead</b>
          <em>OK</em>
        </p>
        <p className="ip-contrast-row">
          <i />
          <b>beleg.app/p/northstar</b>
          <em>LIVE</em>
        </p>
      </div>
    </div>
  );
}

export default async function AboutPage() {
  const { userId } = await auth();
  const signedIn = Boolean(userId);
  const ctaHref = signedIn ? "/dashboard" : "/sign-up";
  const ctaLabel = signedIn ? "Go to your ledger" : "Start a ledger";

  return (
    <main className="landing lp ip">
      <section className="lp-hero ip-hero lp-face-inter">
        <div className="lp-hero-wash" aria-hidden="true" />
        <div className="lp-shell lp-hero-grid">
          <div className="lp-hero-copy">
            <p className="lp-kicker">About</p>
            <h1 className="lp-h1 ip-h1">A record nobody can quietly rewrite.</h1>
            <p className="lp-lead">
              Beleg is German for proof, or receipt. Applications all sound
              finished now. This is a place for dates and confirmations that
              cannot be edited later.
            </p>
          </div>
          <AboutScene />
        </div>
      </section>

      <section className="lp-section ip-section lp-face-jakarta">
        <div className="lp-shell">
          <ol className="ip-facts ip-facts-2">
            <li>
              <h2>What it holds</h2>
              <p>
                The words you recorded, the order, the dates, who confirmed an
                entry, and when that confirmation was sealed.
              </p>
            </li>
            <li>
              <h2>What it does not</h2>
              <p>
                Whether the work was good. Whether a witness is telling the
                truth about the world. The chain only stops anyone, including
                you, from rewriting the history later.
              </p>
            </li>
          </ol>
          <p className="lp-body ip-note">
            Beleg is in beta, and free. If something breaks, email{" "}
            <a href="mailto:beleg.app@proton.me">beleg.app@proton.me</a>.
          </p>
        </div>
      </section>

      <section className="lp-section lp-cta lp-face-inter">
        <div className="lp-shell lp-cta-inner">
          <h2 className="lp-h2 lp-cta-title">
            Start a ledger. Share the link when someone asks you to prove it.
          </h2>
          <div className="lp-actions">
            <Link className="lp-btn lp-btn-primary" href={ctaHref}>
              <span>{ctaLabel}</span>
              <CtaBadge />
            </Link>
            <Link className="lp-btn lp-btn-ghost" href="/how-it-works">
              See how it works
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
