"use client";

import Link from "next/link";

import { CtaBadge } from "@/app/components/CtaBadge";
import { HashText } from "@/app/components/home/HashText";
import { Reveal } from "@/app/components/home/Reveal";

const RECORDS = [
  {
    n: "01",
    title: "Grant received",
    detail: "$12,000",
    who: "Civic Innovation Fund",
    date: "Mar 12, 2026",
    hash: "a3f81c94b7d0e29b",
    state: "SEALED",
  },
  {
    n: "02",
    title: "Confirmed",
    detail: "Maya Chen",
    who: "Civic Innovation Fund",
    date: "Mar 12, 2026",
    hash: "7b02e9f3314fc118",
    state: "WITNESSED",
  },
  {
    n: "03",
    title: "Pilot launched",
    detail: "3 clinics",
    who: "Northstar",
    date: "Apr 02, 2026",
    hash: "c14d6a2e8099e07f",
    state: "SEALED",
  },
];

const LEDGER = [
  {
    n: "03",
    title: "Revenue",
    detail: "$18,400",
    date: "August 14, 2026",
    hash: "81b4c90e12aa77d1",
    state: "WITNESSED",
  },
  {
    n: "02",
    title: "Pilot launched",
    detail: "Civic clinic network",
    date: "July 03, 2026",
    hash: "23fa11c8e90b44a2",
    state: "WITNESSED",
  },
  {
    n: "01",
    title: "Company founded",
    detail: "Northstar",
    date: "June 12, 2026",
    hash: "9c2af1e80d31bb04",
    state: "SEALED",
  },
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
        <p className="bh-brand">Beleg</p>
        <p className="bh-kicker">Verifiable records for real-world progress</p>
        <h1 className="bh-poster">
          <span>Proof,</span>
          <span>not prose.</span>
        </h1>
        <p className="bh-support">
          A sealed timeline of traction anyone can verify.
        </p>
        <Reveal className="bh-slip is-right">
          <article className="bh-record">
            <header className="bh-record-head">
              <span className="bh-n">{RECORDS[0].n}</span>
              <span className="bh-meta">{RECORDS[0].date}</span>
            </header>
            <h2>{RECORDS[0].title}</h2>
            <p className="bh-human">{RECORDS[0].detail}</p>
            <p className="bh-human is-soft">{RECORDS[0].who}</p>
            <footer className="bh-machine">
              <span>{RECORDS[0].state}</span>
              <span>
                SHA-256 <HashText value={RECORDS[0].hash} />
              </span>
            </footer>
          </article>
        </Reveal>
      </section>

      <section className="bh-appear" aria-label="The next records">
        {RECORDS.slice(1).map((item, i) => (
          <div key={item.n} className={`bh-beat${i % 2 ? " is-end" : ""}`}>
            <Reveal className={`bh-slip is-${i % 2 ? "right" : "left"}`}>
              <article className="bh-record">
                <header className="bh-record-head">
                  <span className="bh-n">{item.n}</span>
                  <span className="bh-meta">{item.date}</span>
                </header>
                <h2>{item.title}</h2>
                <p className="bh-human">{item.detail}</p>
                <p className="bh-human is-soft">{item.who}</p>
                <footer className="bh-machine">
                  <span>{item.state}</span>
                  <span>
                    SHA-256 <HashText value={item.hash} />
                  </span>
                </footer>
              </article>
            </Reveal>
          </div>
        ))}

        <Reveal className="bh-spine-wrap">
          <p className="bh-spine" aria-hidden="true">
            <span>01</span>
            <i />
            <span>02</span>
            <i />
            <span>03</span>
            <i />
            <span>04</span>
            <i />
            <span>05</span>
            <b>
              Anchored
              <em>Bitcoin block</em>
            </b>
          </p>
        </Reveal>
      </section>

      <section id="record" className="bh-act">
        <Reveal className="bh-act-num">01</Reveal>
        <div className="bh-act-copy">
          <Reveal>
            <p className="bh-kicker">Record</p>
            <h2 className="bh-h2">Something happened.</h2>
            <p className="bh-body">
              We received a $12,000 grant from the Civic Innovation Fund.
            </p>
          </Reveal>
        </div>
        <Reveal className="bh-act-object" delay={120}>
          <div className="bh-object">
            <p className="bh-meta">01 · Record</p>
            <p className="bh-object-title">Grant received</p>
            <p className="bh-object-sum">$12,000</p>
            <p className="bh-machine">
              <span>Mar 12 2026</span>
              <span>
                SHA-256 <HashText value="a3f81c94b7d0e29b" />
              </span>
            </p>
          </div>
        </Reveal>
      </section>

      <section id="seal" className="bh-act is-flip">
        <Reveal className="bh-act-num">02</Reveal>
        <div className="bh-act-copy">
          <Reveal>
            <p className="bh-kicker">Seal</p>
            <h2 className="bh-h2">The record cannot silently change.</h2>
            <p className="bh-body">
              Title, amount, and date are hashed with the previous seal. There
              is no edit button.
            </p>
          </Reveal>
        </div>
        <Reveal className="bh-act-object" delay={120}>
          <div className="bh-object">
            <p className="bh-meta">02 · Sealed</p>
            <p className="bh-object-title">Grant received</p>
            <p className="bh-object-sum">$12,000</p>
            <dl className="bh-tech">
              <div>
                <dt>Previous</dt>
                <dd>
                  <HashText value="7b02e9f3314fc118" />
                </dd>
              </div>
              <div>
                <dt>Current</dt>
                <dd>
                  <HashText value="a3f81c94b7d0e29b" />
                </dd>
              </div>
              <div>
                <dt>Algorithm</dt>
                <dd>SHA-256</dd>
              </div>
            </dl>
          </div>
        </Reveal>
      </section>

      <section id="witness" className="bh-act">
        <Reveal className="bh-act-num">03</Reveal>
        <div className="bh-act-copy">
          <Reveal>
            <p className="bh-kicker">Witness</p>
            <h2 className="bh-h2">Someone independently confirmed it.</h2>
            <p className="bh-body">
              Maya Chen, who sent the award, confirms in one click. She does
              not need a Beleg account.
            </p>
          </Reveal>
        </div>
        <Reveal className="bh-act-object" delay={120}>
          <div className="bh-object">
            <p className="bh-meta">03 · Witnessed</p>
            <p className="bh-object-title">Confirmed by Maya Chen</p>
            <p className="bh-object-sum">Civic Innovation Fund</p>
            <p className="bh-ok">Witness signed</p>
            <p className="bh-machine">
              <span>Mar 12 2026</span>
              <span>
                SHA-256 <HashText value="7b02e9f3314fc118" />
              </span>
            </p>
          </div>
        </Reveal>
      </section>

      <section id="chain" className="bh-act is-flip">
        <Reveal className="bh-act-num">04</Reveal>
        <div className="bh-act-copy">
          <Reveal>
            <p className="bh-kicker">Chain</p>
            <h2 className="bh-h2">It connects to what came before.</h2>
            <p className="bh-body">
              Change one character and every seal after it fails. The break
              names the first entry that no longer matches.
            </p>
          </Reveal>
        </div>
        <Reveal className="bh-act-object" delay={120}>
          <ol className="bh-links">
            <li className="is-ok">
              <span>01</span>
              <b>Grant</b>
              <HashText value="a3f81c94" />
            </li>
            <li className="is-ok">
              <span>02</span>
              <b>Witness</b>
              <HashText value="7b02e9f3" />
            </li>
            <li className="is-ok">
              <span>03</span>
              <b>Pilot</b>
              <HashText value="c14d6a2e" />
            </li>
          </ol>
        </Reveal>
      </section>

      <section id="anchor" className="bh-act">
        <Reveal className="bh-act-num">05</Reveal>
        <div className="bh-act-copy">
          <Reveal>
            <p className="bh-kicker">Anchor</p>
            <h2 className="bh-h2">The timeline is dated on Bitcoin.</h2>
            <p className="bh-body">
              Pending proofs are stamped with OpenTimestamps. The date does
              not depend on us remaining online.
            </p>
          </Reveal>
        </div>
        <Reveal className="bh-act-object" delay={120}>
          <div className="bh-object">
            <p className="bh-meta">05 · Anchored</p>
            <p className="bh-object-title">Bitcoin block</p>
            <p className="bh-object-sum">#883,214</p>
            <p className="bh-machine">
              <span>OpenTimestamps</span>
              <span>Pending proofs dated</span>
            </p>
          </div>
        </Reveal>
      </section>

      <section id="verify" className="bh-act is-flip">
        <Reveal className="bh-act-num">06</Reveal>
        <div className="bh-act-copy">
          <Reveal>
            <p className="bh-kicker">Verify</p>
            <h2 className="bh-h2">Anyone can check it.</h2>
            <p className="bh-body">
              The public page recomputes every seal in the reviewer&apos;s
              browser. We do not issue the badge.
            </p>
          </Reveal>
        </div>
        <Reveal className="bh-act-object" delay={120}>
          <div className="bh-proof">
            <p className="bh-kicker">This is what verifiable looks like</p>
            <p className="bh-proof-id">Record #014</p>
            <p className="bh-object-title">Revenue received</p>
            <p className="bh-object-sum">$18,400</p>
            <ul className="bh-checks">
              <li>✓ Seal valid</li>
              <li>✓ Previous record valid</li>
              <li>✓ Witness confirmed</li>
              <li>✓ Bitcoin anchored</li>
            </ul>
            <Link className="bh-textlink" href="/verify">
              Verify this record
              <CtaBadge />
            </Link>
          </div>
        </Reveal>
      </section>

      <section className="bh-quiet">
        <Reveal>
          <p className="bh-kicker">Your timeline</p>
          <h2 className="bh-h2">The chain builds as you scroll.</h2>
        </Reveal>
        <Reveal>
          <ol className="bh-ledger">
            {LEDGER.map((item, i) => (
              <Reveal key={item.n} as="li" delay={i * 90}>
                <span className="bh-n">{item.n}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p className="bh-human">{item.detail}</p>
                  <p className="bh-meta">{item.date}</p>
                </div>
                <div className="bh-machine is-end">
                  <span className="bh-ok">{item.state}</span>
                  <span>
                    SHA-256 <HashText value={item.hash} />
                  </span>
                </div>
              </Reveal>
            ))}
          </ol>
        </Reveal>
      </section>

      <section id="about" className="bh-limits">
        <Reveal>
          <p className="bh-kicker">Limits</p>
          <h2 className="bh-poster is-section">
            <span>What does</span>
            <span>proof actually</span>
            <span>prove?</span>
          </h2>
        </Reveal>
        <Reveal className="bh-limit-grid">
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
        </Reveal>
      </section>

      <section className="bh-end">
        <Reveal className="bh-collapse">
          <p className="bh-spine is-end" aria-hidden="true">
            <span>01</span>
            <i />
            <span>02</span>
            <i />
            <span>03</span>
            <i />
            <span>04</span>
            <i />
            <span>05</span>
            <i />
            <span>06</span>
            <b>
              Anchored
            </b>
          </p>
        </Reveal>
        <Reveal>
          <h2 className="bh-poster">
            <span>Proof,</span>
            <span>not prose.</span>
          </h2>
          <Start href={ctaHref} label={ctaLabel} />
        </Reveal>
      </section>
    </main>
  );
}
