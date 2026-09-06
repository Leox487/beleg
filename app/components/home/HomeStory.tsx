"use client";

import Link from "next/link";

import Accordion from "@/app/components/Accordion";
import { CtaBadge } from "@/app/components/CtaBadge";
import { ClaimIdea } from "@/app/components/home/ClaimIdea";
import { HowMechanism } from "@/app/components/home/HowMechanism";
import { LedgerStream } from "@/app/components/home/LedgerStream";
import { ProofCard } from "@/app/components/home/ProofCard";
import { ProofField } from "@/app/components/home/ProofField";
import { ProtocolView } from "@/app/components/home/ProtocolView";
import { PublicLedger } from "@/app/components/home/PublicLedger";
import { ReviewerDemo } from "@/app/components/home/ReviewerDemo";

function Start({ href, label }: { href: string; label: string }) {
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
      <p className="bh-live">
        <i />
        Live · Public beta
      </p>

      <section className="bh-hero">
        <ProofField />
        <div className="bh-hero-copy">
          <p className="bh-kicker">A verification protocol</p>
          <h1 className="bh-poster">
            <span>Proof,</span>
            <span>not prose.</span>
          </h1>
          <p className="bh-support">
            Beleg seals a milestone, chains it, and lets anyone recompute the
            proof. The product is the argument.
          </p>
          <Start href={ctaHref} label={ctaLabel} />
        </div>
        <div className="bh-hero-stage">
          <ProofCard />
        </div>
      </section>

      <LedgerStream />
      <ClaimIdea />
      <HowMechanism />
      <ProtocolView />
      <PublicLedger />
      <ReviewerDemo />

      <section id="privacy" className="bh-priv">
        <div className="bh-inner">
          <p className="bh-kicker">Privacy</p>
          <h2 className="bh-display">Proof without exposure.</h2>
          <div className="bh-priv-grid">
            <ul>
              <li>
                <strong>What is public</strong>
                The text the ledger owner chooses to publish.
              </li>
              <li>
                <strong>What witnesses see</strong>
                Only the event they are asked to confirm.
              </li>
              <li>
                <strong>What Beleg cannot change</strong>
                A sealed record. There is no edit button.
              </li>
              <li>
                <strong>What Beleg does not claim</strong>
                A seal does not make the underlying event true.
              </li>
            </ul>
            <pre className="bh-diagram" aria-label="Privacy model">
              {`YOU
 │
 │  create record
 ▼
BELEG
 ├── event
 ├── witness
 ├── timestamp
 └── seal
       │
       ▼
PUBLIC PROOF

private information
───────────────╳
never exposed`}
            </pre>
          </div>
          <p className="bh-priv-more">
            Full practices live on the{" "}
            <Link href="/privacy">Privacy</Link> and{" "}
            <Link href="/terms">Terms</Link> pages.
          </p>
        </div>
      </section>

      <section id="uses" className="bh-uses">
        <p className="bh-kicker">Who it&apos;s for</p>
        <article className="bh-story is-grant">
          <p>Grants</p>
          <h2>“We received the award.”</h2>
          <ol>
            <li>Application</li>
            <li>Award</li>
            <li>Witness</li>
            <li>Proof</li>
          </ol>
        </article>
        <article className="bh-story is-start">
          <p>Startups</p>
          <h2>“We launched the pilot.”</h2>
          <p className="bh-story-line">
            Pilot launched <span>→</span> 3 clinics <span>→</span> confirmation{" "}
            <span>→</span> timeline
          </p>
        </article>
        <article className="bh-story is-quiet">
          <p>Confidential work</p>
          <h2>“We completed the engagement.”</h2>
          <p className="bh-story-seal">
            Milestone · Witnessed · Sealed 14:38:07 UTC
          </p>
        </article>
      </section>

      <section id="about" className="bh-bounds">
        <p className="bh-kicker">Boundaries</p>
        <h2 className="bh-display">What Beleg proves — and what it does not.</h2>
        <div className="bh-bounds-grid">
          <div>
            <p>It can establish</p>
            <ul>
              <li>That a record existed in a particular form.</li>
              <li>That a witness confirmed it.</li>
              <li>That later records did not silently rewrite the history.</li>
              <li>That a timestamp or Bitcoin anchor exists.</li>
            </ul>
          </div>
          <div>
            <p>It cannot establish</p>
            <ul>
              <li>That a claim was true simply because it was recorded.</li>
              <li>That a witness acted honestly.</li>
              <li>That the real-world event happened independently of the evidence.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bh-compare">
        <p className="bh-kicker">Where evidence normally lives</p>
        <table>
          <thead>
            <tr>
              <th />
              <th>Email</th>
              <th>PDF</th>
              <th>Deck</th>
              <th>Beleg</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>Timestamp</th>
              <td>~</td>
              <td>~</td>
              <td>~</td>
              <td className="bh-ok">Yes</td>
            </tr>
            <tr>
              <th>Witness</th>
              <td>~</td>
              <td>Sometimes</td>
              <td>~</td>
              <td className="bh-ok">Yes</td>
            </tr>
            <tr>
              <th>Immutable</th>
              <td>No</td>
              <td>No</td>
              <td>No</td>
              <td className="bh-ok">Yes</td>
            </tr>
            <tr>
              <th>Public URL</th>
              <td>~</td>
              <td>~</td>
              <td>Sometimes</td>
              <td className="bh-ok">Yes</td>
            </tr>
            <tr>
              <th>Independent verification</th>
              <td>No</td>
              <td>No</td>
              <td>No</td>
              <td className="bh-ok">Yes</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section id="tech" className="bh-tech">
        <p className="bh-kicker">Technical layer</p>
        <h2 className="bh-display">Verify it yourself.</h2>
        <pre className="bh-code">{`const res = await fetch("/api/public/your-slug/entries")
const chain = await res.json()
const valid = await recompute(chain)

console.log(valid)
// true — in this browser, not ours`}</pre>
        <ul className="bh-metrics">
          <li>
            <b>SHA-256</b>
            cryptographic sealing
          </li>
          <li>
            <b>OpenTimestamps</b>
            external anchoring
          </li>
          <li>
            <b>Browser</b>
            independent verification
          </li>
          <li>
            <b>No account</b>
            for witnesses
          </li>
        </ul>
        <Link className="bh-textlink" href="/verify-guide">
          Read the verification guide
          <CtaBadge />
        </Link>
      </section>

      <section id="faq" className="bh-faq">
        <p className="bh-kicker">Questions</p>
        <h2 className="bh-display">Straight answers.</h2>
        <div className="bh-faq-list">
          <Accordion title="What exactly does Beleg verify?">
            <p>
              That a record existed in a particular form, that later entries
              still hash back to it, and — when a stamp is present — that the
              timeline was dated with OpenTimestamps. It does not verify that
              the sentence is true.
            </p>
          </Accordion>
          <Accordion title="Can a witness confirm without creating an account?">
            <p>
              Yes. A witness opens a confirmation link and signs that one
              event. They do not need a Beleg account.
            </p>
          </Accordion>
          <Accordion title="What happens if someone edits a record?">
            <p>
              They cannot. There is no edit button. A mistake is corrected by a
              new entry. The original stays, the correction is visible, and the
              chain stays intact.
            </p>
          </Accordion>
          <Accordion title="Are records public?">
            <p>
              Anyone with the proof URL can read the page and the JSON feed.
              Treat the slug as a publication. Do not put secrets on a ledger.
            </p>
          </Accordion>
          <Accordion title="Can I remove a record?">
            <p>
              No. If a sealed line could disappear, the proof would be
              meaningless. Correct it with a later entry.
            </p>
          </Accordion>
          <Accordion title="What does “sealed” mean?">
            <p>
              Title, amount, date, and the previous hash are collapsed into
              SHA-256. Change any of those and the seal no longer matches.
            </p>
          </Accordion>
          <Accordion title="What does Bitcoin have to do with Beleg?">
            <p>
              Pending proofs can be dated on Bitcoin with OpenTimestamps. That
              is the only use. There are no tokens, wallets, or gas fees.
            </p>
          </Accordion>
          <Accordion title="Do I need cryptocurrency?">
            <p>No. Reviewers and ledger owners never handle Bitcoin.</p>
          </Accordion>
          <Accordion title="Can I use Beleg for confidential work?">
            <p>
              Yes, if you publish only the fact you intend to prove — a
              milestone and a date, not the underlying files. Beleg does not
              accept uploads and is not a private vault.
            </p>
          </Accordion>
          <Accordion title="Can someone verify a proof without trusting Beleg?">
            <p>
              Yes. Verification recomputes every seal in the reviewer&apos;s
              browser from the public JSON. The page at{" "}
              <Link href="/verify">/verify</Link> is one way to do that.
            </p>
          </Accordion>
          <Accordion title="What happens if Beleg disappears?">
            <p>
              Anchored proofs are downloadable and checkable with open-source
              tools against the public Bitcoin chain. That check does not
              depend on this site staying up.
            </p>
          </Accordion>
          <Accordion title="Does a timestamp prove the underlying event was true?">
            <p>
              No. It proves when that text was sealed. Truth still comes from
              witnesses and the evidence behind the claim.
            </p>
          </Accordion>
        </div>
        <Link className="bh-textlink" href="/faq">
          More questions
          <CtaBadge />
        </Link>
      </section>

      <section id="start" className="bh-end">
        <h2 className="bh-poster is-end">
          <span>Make the next</span>
          <span>milestone verifiable.</span>
        </h2>
        <Start href={ctaHref} label={ctaLabel} />
      </section>
    </main>
  );
}
