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
      <section className="lp-hero ip-hero">
        <div className="lp-hero-wash" aria-hidden="true" />
        <div className="lp-shell lp-hero-grid">
          <div className="lp-hero-copy">
            <p className="lp-kicker">About</p>
            <h1 className="lp-h1 ip-h1">A record nobody can quietly rewrite.</h1>
            <p className="lp-lead">
              Beleg is German for proof, or receipt. It is an append-only
              ledger for people whose best work is real and hard for a stranger
              to check.
            </p>
          </div>
          <AboutScene />
        </div>
      </section>

      <section className="lp-section ip-section">
        <div className="lp-shell ip-read">
          <p className="lp-eyebrow">Why</p>
          <h2 className="lp-h2">Applications all sound finished now.</h2>
          <p className="lp-body">
            Grants, competitions, accelerators, investment. The prose is
            polished because the same models write most of it. A reviewer cannot
            tell from the essay whether the traction is real.
          </p>
          <p className="lp-body">
            Beleg exists so the dates and confirmations sit somewhere that
            cannot be edited after the fact.
          </p>
        </div>
      </section>

      <section className="lp-section ip-section">
        <div className="lp-shell ip-read">
          <p className="lp-eyebrow">What it does</p>
          <h2 className="lp-h2">You write a milestone when it happens.</h2>
          <p className="lp-body">
            Each entry is hashed and linked to the one before it. Change,
            delete, or shuffle anything and every seal after it fails. People
            who were there can confirm an entry in one click. Those
            confirmations are sealed too. Periodically the latest hash is
            written to Bitcoin, so the date is checkable against a network
            nobody here controls.
          </p>
          <p className="lp-body">
            A reviewer gets one public link. Their browser redoes the math.
          </p>
        </div>
      </section>

      <section className="lp-section lp-light">
        <div className="lp-light-grid" aria-hidden="true" />
        <span className="lp-light-scan" aria-hidden="true" />
        <div className="lp-shell lp-wide">
          <div className="lp-light-head">
            <p className="lp-eyebrow">What it does not do</p>
            <h2 className="lp-h2">
              A sealed line is not the same thing as the event being true.
            </h2>
          </div>
          <div className="ip-light-split">
            <div className="ip-light-copy">
              <div className="lp-art lp-art-nodes lp-art-ok" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </div>
              <p className="lp-honest-label">The chain holds</p>
              <p className="lp-body">
                The words you recorded, the order, the dates, who confirmed an
                entry, and when that confirmation was sealed.
              </p>
            </div>
            <div className="ip-light-copy">
              <div className="lp-art lp-art-nodes lp-art-no" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </div>
              <p className="lp-honest-label">Still on you</p>
              <p className="lp-body">
                Whether the prototype shipped. Whether a witness is telling the
                truth about the world. Whether the work was any good. The chain
                only stops anyone, including you, from rewriting the history
                later.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-section ip-section">
        <div className="lp-shell ip-read">
          <p className="lp-eyebrow">Who built this</p>
          <h2 className="lp-h2">A boring question, then a ledger.</h2>
          <p className="lp-body">
            If AI makes every application sound the same, what can a reviewer
            actually check? Not another writing tool.
          </p>
          <p className="lp-eyebrow ip-status-kicker">Status</p>
          <p className="lp-body">
            Beleg is in beta, and free. The cryptography is real. The Bitcoin
            timestamps are real. If something breaks, email{" "}
            <a href="mailto:beleg.app@proton.me">beleg.app@proton.me</a>.
          </p>
        </div>
      </section>

      <section className="lp-section lp-cta">
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
