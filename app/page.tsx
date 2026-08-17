import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

import { BelegMark } from "@/app/components/BelegMark";
import { ChainField } from "@/app/components/ChainField";
import { CtaBadge } from "@/app/components/CtaBadge";
import { Footer } from "@/app/components/Footer";
import {
  StageSeal,
  StageVerify,
  StageWitness,
} from "@/app/components/HomeStages";
import { Showcase } from "@/app/components/Showcase";

const FEATURES = [
  {
    stage: "seal" as const,
    kicker: "01  Record",
    title: "Each entry is hashed and linked to the one before it.",
    text: "You add a milestone: a grant, a ship, a signed pilot. Beleg stores the title, the detail, the date, and a SHA-256 fingerprint of that payload plus the previous seal. Change anything later and every seal after it no longer matches. There is no edit button. The past stays as you wrote it.",
    aside: "A reviewer does not have to trust a PDF you exported. They recompute the same hashes in their browser.",
  },
  {
    stage: "witness" as const,
    kicker: "02  Witness",
    title: "Someone who was there can confirm it, without an account.",
    text: "A grant officer, a client, or a mentor gets a one-click link. Their name and statement become a new sealed entry on the same chain, not a screenshot in a slide. If they never confirm, the original record still stands. If they do, the confirmation is as hard to quietly remove as the milestone itself.",
    aside: "Witnesses are not creating Beleg accounts. They are attaching a statement to a specific entry.",
  },
  {
    stage: "verify" as const,
    kicker: "03  Verify",
    title: "The check runs on the reviewer's machine.",
    text: "The public page is a timeline plus a Verify button. That button does not call a Beleg API for a badge. It walks the chain locally: each content hash, each previous-hash link, the order of sequence numbers. Intact or broken is a math result, not a status we issue.",
    aside: "If Beleg disappeared tomorrow, the same check would still work from the published JSON.",
  },
];

const SPEC = [
  {
    field: "seq",
    meaning: "Position in the ledger. #01, #02, #03.",
    mutable: "No",
  },
  {
    field: "kind",
    meaning: "What kind of event this is: milestone, grant, revenue, email, attestation.",
    mutable: "No",
  },
  {
    field: "title / body",
    meaning: "The words you sealed. This is what a reviewer actually reads.",
    mutable: "No",
  },
  {
    field: "occurred_at",
    meaning: "The date you said it happened. Recorded next to when you sealed it.",
    mutable: "No",
  },
  {
    field: "content_hash",
    meaning: "SHA-256 of the payload. Same input, same fingerprint.",
    mutable: "No",
  },
  {
    field: "prev_hash",
    meaning: "The seal of the entry before this one. That is the chain.",
    mutable: "No",
  },
  {
    field: "attestation",
    meaning: "A witness confirmation. It is appended as its own entry, not patched onto the old one.",
    mutable: "Append only",
  },
];

const CASES = [
  {
    who: "Grant applicant",
    record:
      "The award the day the decision email arrives, including amount, fund name, and date.",
    witness:
      "The program officer who issued it. They confirm in one click. No Beleg account.",
    review:
      "A reviewer opens your public page, runs Verify, and sees the officer's name on the chain.",
  },
  {
    who: "Solo founder",
    record:
      "Ships, first revenue, pilots. Each one sealed when it happened, not reconstructed for a pitch.",
    witness:
      "A customer, an accountant, or whoever actually saw the work. Optional, but stronger.",
    review:
      "Accelerators get a link instead of a traction slide that cannot be checked.",
  },
  {
    who: "Work under NDA",
    record:
      "That an engagement existed, for whom, and when. Not the repo, not the confidential spec.",
    witness:
      "The client confirms the engagement. The code never has to leave their side.",
    review:
      "A hiring panel or grant desk sees the confirmation, not the source.",
  },
];

const REVIEW_STEPS = [
  {
    n: "01",
    title: "Open the public page",
    text: "It is a timeline. Sequence, dates, titles, who confirmed what. No login.",
  },
  {
    n: "02",
    title: "Run Verify in your browser",
    text: "The page recomputes every seal locally. Intact means the hashes still match. Broken names the first entry that does not.",
  },
  {
    n: "03",
    title: "Read the witnesses",
    text: "Confirmations are entries on the same chain. A name and a statement, sealed after the fact they describe.",
  },
  {
    n: "04",
    title: "Compare it to the application",
    text: "Dates and amounts should line up with what they wrote. If they do not, that is the finding. Beleg does not grade the project.",
  },
];

export default async function Home() {
  const { userId } = await auth();
  const signedIn = Boolean(userId);
  const ctaHref = signedIn ? "/dashboard" : "/sign-up";
  const startLabel = signedIn ? "Go to your ledger" : "Start";

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
              <span className="cta-label">{startLabel}</span>
              <CtaBadge />
            </Link>
            <Link className="ghost-link land-hero-prove-ghost" href="/how-it-works">
              See how it works
            </Link>
          </div>
        </div>
      </section>

      <hr className="rule-fade land-rule land-rule-hero" />

      <section className="section-full land-section">
        <div className="section-full-inner">
          <p className="home-kicker">
            Grant desks, accelerators, and hiring panels still have to take a
            screenshot&apos;s word for it.
          </p>
          <div className="home-problem">
            <div>
              <p className="home-problem-label">What they get today</p>
              <p className="home-detail">
                A traction slide assembled the night before. A grant letter as a
                photo. A client name that cannot be checked without an email
                thread. Memory, PDFs, and whoever is willing to vouch in Slack.
              </p>
            </div>
            <div>
              <p className="home-problem-label">What a Beleg page is</p>
              <p className="home-detail">
                A public timeline of what you recorded, when you recorded it,
                and who confirmed it. Each line is sealed to the one before it.
                Anyone can recompute the seals without creating an account or
                asking us.
              </p>
            </div>
          </div>
        </div>
      </section>

      <hr className="rule-fade land-rule" />

      <section className="section-full strip-section land-band home-scene home-scene-how">
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

      <section className="section-full land-section">
        <div className="section-full-inner">
          <p className="home-kicker">
            Three things a reviewer can inspect without taking your word for it.
          </p>
          <div className="home-features">
            {FEATURES.map((item, i) => (
              <article
                key={item.stage}
                className={`home-feature${i % 2 === 1 ? " is-flip" : ""}`}
              >
                <div className="home-feature-copy">
                  <p className="home-feature-kicker">{item.kicker}</p>
                  <h2 className="home-feature-title">{item.title}</h2>
                  <p className="home-detail">{item.text}</p>
                  <p className="home-feature-aside">{item.aside}</p>
                </div>
                <div className="home-feature-stage">
                  {item.stage === "seal" ? (
                    <StageSeal />
                  ) : item.stage === "witness" ? (
                    <StageWitness />
                  ) : (
                    <StageVerify />
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <hr className="rule-fade land-rule" />

      <section className="section-full land-section">
        <div className="section-full-inner">
          <p className="home-kicker">What a sealed entry actually contains.</p>
          <p className="home-lede">
            This is the payload that gets hashed. None of it can be edited after
            you record it. A correction is a new entry.
          </p>
          <div className="home-spec-wrap">
            <table className="home-spec">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>What it is</th>
                  <th>After sealing</th>
                </tr>
              </thead>
              <tbody>
                {SPEC.map((row) => (
                  <tr key={row.field}>
                    <td className="mono">{row.field}</td>
                    <td>{row.meaning}</td>
                    <td className="mono">{row.mutable}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <hr className="rule-fade land-rule" />

      <section className="section-full land-section">
        <div className="section-full-inner">
          <p className="home-kicker">
            Three situations where a paper trail does not already exist.
          </p>
          <ul className="home-cases">
            {CASES.map((c) => (
              <li key={c.who} className="home-case">
                <p className="home-case-who">{c.who}</p>
                <div className="home-case-grid">
                  <div>
                    <p className="home-problem-label">You record</p>
                    <p className="home-detail">{c.record}</p>
                  </div>
                  <div>
                    <p className="home-problem-label">They confirm</p>
                    <p className="home-detail">{c.witness}</p>
                  </div>
                  <div>
                    <p className="home-problem-label">A reviewer sees</p>
                    <p className="home-detail">{c.review}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <p className="section-outlink">
            <Link className="ghost-link ghost-link-accent" href="/uses">
              More situations Beleg is built for
            </Link>
          </p>
        </div>
      </section>

      <hr className="rule-fade land-rule" />

      <section className="section-full land-section">
        <div className="section-full-inner">
          <p className="home-kicker">
            For grant officers and accelerators checking traction.
          </p>
          <ol className="home-steps">
            {REVIEW_STEPS.map((step) => (
              <li key={step.n} className="home-step">
                <span className="home-step-n mono">{step.n}</span>
                <div>
                  <p className="home-step-title">{step.title}</p>
                  <p className="home-detail">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="section-outlink">
            <Link className="ghost-link ghost-link-accent" href="/for-reviewers">
              Learn how reviewers use Beleg
            </Link>
          </p>
        </div>
      </section>

      <hr className="rule-fade land-rule" />

      <section className="section-full land-section">
        <div className="section-full-inner">
          <p className="home-kicker">What the chain proves, and what it does not.</p>
          <div className="home-honest">
            <div className="home-honest-col">
              <p className="home-problem-label">Sealed</p>
              <ul className="home-honest-list">
                <li>The order of entries</li>
                <li>The words and dates you recorded</li>
                <li>The SHA-256 seals and previous-hash links</li>
                <li>Who confirmed an entry, and when that confirmation was sealed</li>
              </ul>
            </div>
            <div className="home-honest-col">
              <p className="home-problem-label">Not claimed</p>
              <ul className="home-honest-list">
                <li>That the work was good, or the grant deserved</li>
                <li>That a witness is telling the truth about the world</li>
                <li>That Beleg has audited your company</li>
                <li>That a missing confirmation means the event did not happen</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <hr className="rule-fade land-rule" />

      <section className="section-full land-section land-cta land-band">
        <div className="land-band-inner land-cta-inner section-full-inner">
          <p className="home-kicker home-kicker-center">
            Start a ledger. Share the link when someone asks you to prove it.
          </p>
          <div className="land-hero-prove-actions">
            <Link className="cta" href={ctaHref}>
              <span className="cta-label">{startLabel}</span>
              <CtaBadge />
            </Link>
            <Link className="ghost-link land-hero-prove-ghost" href="/how-it-works">
              See how it works
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
