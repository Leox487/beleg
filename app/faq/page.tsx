import type { Metadata } from "next";
import Link from "next/link";

import Accordion from "@/app/components/Accordion";
import { Footer } from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "Questions · Beleg",
  description:
    "Straight answers about what Beleg proves, what it doesn't, and what happens if it shuts down.",
};

export default function FaqPage() {
  return (
    <main className="page">
      <div className="page-inner doc doc-narrow">
        <header className="doc-header">
          <p className="doc-eyebrow">Common questions</p>
          <h1 className="h1 doc-title">Questions</h1>
        </header>

        <div className="faq-list">
          <Accordion title="Is this a blockchain product?">
            <p>
              Beleg uses Bitcoin for exactly one thing: independently
              timestamping your ledger so its existence at a specific date is
              provable without trusting us. Your data lives in a normal
              database. There are no tokens, no wallets, no gas fees.
            </p>
          </Accordion>

          <Accordion title="Can I edit or delete an entry?">
            <p>
              No, and that&apos;s the point. If entries could be changed, the
              proof would be meaningless. If you made a mistake, add a new entry
              correcting it. The original stays, the correction is visible, and
              the chain stays intact. That&apos;s how amendments work in real
              records.
            </p>
          </Accordion>

          <Accordion title="What does the verifier actually check?">
            <p>
              It recomputes every seal from scratch in your browser and confirms
              every link in the chain holds. If anything changed, it tells you
              exactly which entry broke. Your browser does the math. It
              doesn&apos;t ask our server for the answer.
            </p>
          </Accordion>

          <Accordion title="Does Beleg prove my claims are true?">
            <p>
              No. Beleg proves when something was recorded and that it
              hasn&apos;t changed since. Truth comes from the witnesses who
              attest and the evidence behind it. A sealed entry saying
              &quot;signed a contract&quot; proves you wrote that sentence on
              that date, not that the contract exists.
            </p>
          </Accordion>

          <Accordion title="Who can see my proof page?">
            <p>
              Only people you send the link to. Beleg doesn&apos;t publish or
              index your page.
            </p>
          </Accordion>

          <Accordion title="What if Beleg shuts down?">
            <p>
              Your anchored proofs are downloadable and verifiable using
              open-source tools against the public Bitcoin blockchain. No
              dependency on us surviving.
            </p>
          </Accordion>

          <Accordion title="Is it free?">
            <p>Yes, while in beta.</p>
          </Accordion>

          <Accordion title="Who built this?">
            <p>
              An independent project. The product and why it exists are on{" "}
              <Link href="/about">About</Link>.
            </p>
          </Accordion>
        </div>
      </div>

      <Footer />
    </main>
  );
}
