import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

import ChainLab from "@/app/components/ChainLab";
import { CtaBadge } from "@/app/components/CtaBadge";
import { Footer } from "@/app/components/Footer";
import HowBeats from "@/app/components/HowBeats";
import {
  StageSeal,
  StageVerify,
  StageWitness,
} from "@/app/components/HomeStages";

export const metadata: Metadata = {
  title: "How Beleg Works · Beleg",
  description:
    "Hash chains, in-browser verification, witness confirmations, and Bitcoin timestamps, in plain English.",
};

export default async function HowItWorksPage() {
  const { userId } = await auth();
  const signedIn = Boolean(userId);
  const ctaHref = signedIn ? "/dashboard" : "/sign-up";
  const ctaLabel = signedIn ? "Go to your ledger" : "Start a ledger";

  return (
    <main className="landing lp ip">
      <section className="lp-hero ip-hero">
        <div className="lp-hero-wash" aria-hidden="true" />
        <div className="lp-shell">
          <p className="lp-kicker">How it works</p>
          <h1 className="lp-h1 ip-h1">A chain you can break on this page.</h1>
          <p className="lp-lead">
            Each milestone is sealed with a fingerprint and linked to the one
            before it. The people who were there can confirm an entry. Anyone
            you share the record with can recompute every seal in their own
            browser. They do not have to take your word for it, or ours.
          </p>
        </div>
      </section>

      <section className="lp-section ip-section ip-anchor" id="beats">
        <div className="lp-shell">
          <p className="lp-eyebrow">Twenty seconds</p>
          <h2 className="lp-h2">Fingerprint, chain, break, timestamp, check.</h2>
          <HowBeats />
        </div>
      </section>

      <section className="lp-section ip-section ip-anchor" id="try">
        <div className="lp-shell">
          <p className="lp-eyebrow">Try it</p>
          <h2 className="lp-h2">Change one character in entry #1.</h2>
          <p className="lp-body ip-intro">
            These are real SHA-256 seals, computed in your browser right now.
            Edit the first line and watch every seal after it fail.
          </p>
          <div className="ip-lab">
            <ChainLab />
          </div>
        </div>
      </section>

      <section className="lp-section ip-section">
        <div className="lp-shell">
          <p className="lp-eyebrow">The longer version</p>
          <h2 className="lp-h2">What actually gets sealed.</h2>
          <div className="lp-features">
            <article className="lp-feature ip-anchor" id="record">
              <div className="lp-feature-copy">
                <p className="lp-feature-kicker">01 · The chain</p>
                <h3 className="lp-feature-title">
                  Each hash is built from the entry plus the hash before it.
                </h3>
                <p className="lp-body">
                  Title, body, date, timestamp, run through SHA-256. Same input,
                  same fingerprint. Change one character and you get a different
                  one. Entry #2 includes entry #1&apos;s hash. Entry #3 includes
                  #2&apos;s. The first entry links to a genesis value of zeros.
                </p>
                <p className="lp-body">
                  Edit #1 later and its hash changes, so #2 no longer matches, so
                  #3 does not either. That is why there is no edit button. You
                  can only add to the end.
                </p>
              </div>
              <div className="lp-feature-stage">
                <StageSeal />
              </div>
            </article>

            <article className="lp-feature lp-feature-flip ip-anchor" id="witness">
              <div className="lp-feature-copy">
                <p className="lp-feature-kicker">02 · Witnesses</p>
                <h3 className="lp-feature-title">
                  A confirmation is another sealed entry, not a comment.
                </h3>
                <p className="lp-body">
                  When someone confirms, their name and statement are hashed and
                  linked like everything else. They cannot be edited, backdated,
                  or pulled off later. They do not need a Beleg account.
                </p>
              </div>
              <div className="lp-feature-stage">
                <StageWitness />
              </div>
            </article>

            <article className="lp-feature ip-anchor" id="verify">
              <div className="lp-feature-copy">
                <p className="lp-feature-kicker">03 · The verifier</p>
                <h3 className="lp-feature-title">
                  The check runs on the reviewer&apos;s machine.
                </h3>
                <p className="lp-body">
                  Open a public proof page and hit Verify. The browser downloads
                  the entries, recomputes every hash, and checks the links. Green
                  means they still match. Red names the first entry that does
                  not.
                </p>
                <p className="lp-body">
                  The math does not ask our server for a verdict. If the
                  database were altered, the verifier would still catch it,
                  unless every later hash was rewritten too. Bitcoin anchoring
                  is what makes even that rewrite fail.
                </p>
              </div>
              <div className="lp-feature-stage">
                <StageVerify />
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="lp-section lp-light">
        <div className="lp-light-grid" aria-hidden="true" />
        <span className="lp-light-scan" aria-hidden="true" />
        <div className="lp-shell lp-wide">
          <div className="lp-light-head ip-anchor" id="timestamp">
            <p className="lp-eyebrow">Timestamp</p>
            <h2 className="lp-h2">
              The newest seal is written into Bitcoin, where nobody here can
              rewrite it.
            </h2>
          </div>
          <div className="ip-light-split">
            <div className="ip-light-copy">
              <div className="ip-btc" aria-hidden="true">
                <span className="ip-btc-hash">c14d6a2e80…99e07f</span>
                <span className="ip-btc-arrow" />
                <span className="ip-btc-block">OpenTimestamps · Bitcoin</span>
              </div>
              <p className="lp-body">
                Periodically the latest hash is submitted through OpenTimestamps,
                a free open protocol. Once it is in a Bitcoin block, the date is
                checkable against a network of machines we do not run. If Beleg
                disappeared tomorrow, anyone with the <code>.ots</code> proof
                could still show that this ledger existed on that day, using
                open-source tools and the public chain.
              </p>
            </div>
            <div className="ip-light-copy ip-anchor" id="limits">
              <p className="lp-honest-label">What this does not do</p>
              <p className="lp-body">
                Beleg proves integrity (nothing changed) and timing (when it was
                recorded). It does not prove the claim is true. A sealed line
                that says &quot;shipped the prototype&quot; proves you wrote
                those words on that date. Whether the prototype shipped is a
                job for witnesses and evidence.
              </p>
              <p className="lp-body">
                SHA-256 is a public standard. The chain is a linked list of
                hashes. OpenTimestamps is open source. Checking a Beleg page
                does not require proprietary software, or trusting a company.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-section lp-cta">
        <div className="lp-shell lp-cta-inner">
          <h2 className="lp-h2 lp-cta-title">
            Record one milestone. Share the link when someone asks.
          </h2>
          <div className="lp-actions">
            <Link className="lp-btn lp-btn-primary" href={ctaHref}>
              <span>{ctaLabel}</span>
              <CtaBadge />
            </Link>
            <Link className="lp-btn lp-btn-ghost" href="/uses">
              See who it is for
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
