"use client";

import Link from "next/link";

import { CtaBadge } from "@/app/components/CtaBadge";
import { HashText } from "@/app/components/home/HashText";
import { Reveal } from "@/app/components/home/Reveal";

const TIMELINE = [
  {
    n: "01",
    title: "Grant received",
    detail: "$12,000",
    who: "Civic Innovation Fund",
    date: "Mar 12",
    year: "2026",
    hash: "a3f81c94b7d0e29b",
    state: "SEALED",
  },
  {
    n: "02",
    title: "Confirmed",
    detail: "Maya Chen",
    who: "Civic Innovation Fund",
    date: "Mar 12",
    year: "2026",
    hash: "7b02e9f3314fc118",
    state: "WITNESSED",
  },
  {
    n: "03",
    title: "Pilot launched",
    detail: "3 clinics",
    who: "Northstar",
    date: "Apr 02",
    year: "2026",
    hash: "c14d6a2e8099e07f",
    state: "SEALED",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Record",
    text: "A milestone is captured and sealed. There is no edit button.",
  },
  {
    n: "02",
    title: "Witness",
    text: "Someone who was there confirms it. They do not need an account.",
  },
  {
    n: "03",
    title: "Anchor",
    text: "Pending proofs are dated on Bitcoin with OpenTimestamps.",
  },
  {
    n: "04",
    title: "Verify",
    text: "Anyone recomputes the seals in their own browser.",
  },
];

const CHAIN = [
  { label: "Record", value: "Grant received · $12,000" },
  { label: "Seal", value: "a3f81c94b7d0e29b" },
  { label: "Previous", value: "7b02e9f3314fc118" },
  { label: "Current", value: "a3f81c94b7d0e29b" },
  { label: "Witness", value: "Maya Chen · signed" },
  { label: "Bitcoin anchor", value: "Block #883,214" },
];

function Start({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link className="bh-btn" href={href}>
      {label}
      <CtaBadge />
    </Link>
  );
}

export function HomeStory({
  ctaHref,
  ctaLabel,
}: {
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <main className="beleg-home">
      <section className="bh-hero">
        <div className="bh-hero-copy">
          <p className="bh-kicker">Verifiable records for real-world progress</p>
          <h1 className="bh-poster">
            <span>Proof,</span>
            <span>not prose.</span>
          </h1>
          <p className="bh-support">
            A sealed timeline of traction anyone can verify.
          </p>
          <Start href={ctaHref} label={ctaLabel} />
        </div>

        <article className="bh-doc">
          <header className="bh-doc-head">
            <span>01</span>
            <span>Mar 12, 2026</span>
          </header>
          <h2>Grant received</h2>
          <p className="bh-doc-sum">$12,000</p>
          <p className="bh-doc-who">Civic Innovation Fund</p>
          <footer className="bh-doc-foot">
            <span>Sealed</span>
            <span>
              SHA-256 <HashText value="a3f81c94b7d0e29b" />
            </span>
          </footer>
        </article>
      </section>

      <section className="bh-band">
        <Reveal className="bh-split">
          <div>
            <p className="bh-kicker">The problem</p>
            <h2 className="bh-h2">Important progress disappears into prose.</h2>
            <p className="bh-body">
              Applications, updates, and decks all sound finished. Dates get
              moved. Confirmations stay in email. A reviewer is asked to trust
              the writing.
            </p>
          </div>
          <p className="bh-aside">
            Beleg keeps the event, the order, and the confirmation. The claim
            still has to be true. The history cannot be quietly rewritten.
          </p>
        </Reveal>
      </section>

      <section className="bh-band">
        <Reveal>
          <p className="bh-kicker">Recent records</p>
          <ol className="bh-timeline">
            {TIMELINE.map((item) => (
              <li key={item.n}>
                <span className="bh-tl-n">{item.n}</span>
                <div className="bh-tl-main">
                  <h3>{item.title}</h3>
                  <p>
                    {item.detail}
                    <span>{item.who}</span>
                  </p>
                </div>
                <div className="bh-tl-meta">
                  <span>
                    {item.date} {item.year}
                  </span>
                  <span className={item.state === "WITNESSED" ? "bh-ok" : undefined}>
                    {item.state}
                  </span>
                </div>
              </li>
            ))}
          </ol>
          <p className="bh-tl-foot">
            3 records · 1 witness · Anchored to Bitcoin
          </p>
        </Reveal>
      </section>

      <section id="record" className="bh-band">
        <Reveal>
          <p className="bh-kicker">How it works</p>
          <ol className="bh-steps">
            {STEPS.map((step) => (
              <li key={step.n}>
                <span>{step.n}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      <section className="bh-band bh-band-chain">
        <Reveal className="bh-split">
          <div>
            <p className="bh-kicker">Public proof</p>
            <h2 className="bh-h2">This is what verifiable looks like.</h2>
            <p className="bh-body">
              A reviewer does not take our word for it. They recompute every
              seal, then follow the chain to the Bitcoin stamp.
            </p>
            <Link className="bh-textlink" href="/verify">
              Verify a ledger
              <CtaBadge />
            </Link>
          </div>
          <ol className="bh-chain">
            {CHAIN.map((item) => (
              <li key={item.label}>
                <span>{item.label}</span>
                {item.label === "Seal" ||
                item.label === "Previous" ||
                item.label === "Current" ? (
                  <HashText value={item.value} />
                ) : (
                  <b>{item.value}</b>
                )}
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      <section id="about" className="bh-band">
        <Reveal>
          <p className="bh-kicker">Limits</p>
          <h2 className="bh-poster is-section">
            <span>What does</span>
            <span>proof actually prove?</span>
          </h2>
          <div className="bh-limit-grid">
            <div>
              <p className="bh-kicker">It holds</p>
              <ul>
                <li>✓ That the record exists</li>
                <li>✓ That its order has not changed</li>
                <li>✓ That the witness signed</li>
                <li>✓ That the timeline was anchored</li>
              </ul>
            </div>
            <div>
              <p className="bh-kicker">It does not</p>
              <ul className="is-not">
                <li>— That the claim is true</li>
                <li>— That the work was good</li>
                <li>— That the company will succeed</li>
              </ul>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="bh-end">
        <Reveal>
          <h2 className="bh-poster is-end">
            <span>Proof,</span>
            <span>not prose.</span>
          </h2>
          <Start href={ctaHref} label={ctaLabel} />
        </Reveal>
      </section>
    </main>
  );
}
