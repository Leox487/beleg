import type { Metadata } from "next";

import { Footer } from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Service — Beleg",
  description:
    "The terms you agree to when using Beleg, including what the ledger does and does not prove.",
};

export default function TermsPage() {
  return (
    <main className="page">
      <div className="page-inner doc">
        <header className="doc-header">
          <h1 className="h1 doc-title">Terms of Service</h1>
          <p className="small">Last updated: July 31, 2026</p>
        </header>

        <div className="card doc-body">
          <p>
            By using Beleg, you agree to these terms. If you disagree,
            don&apos;t use the service.
          </p>

          <h2>What Beleg is</h2>
          <p>
            Beleg is a tool that records business milestones in an append-only,
            cryptographically chained ledger. It is not a legal document system,
            a notary service, a financial tool, or a replacement for
            professional advice of any kind.
          </p>

          <h2>What Beleg proves and does not prove</h2>
          <p>
            Beleg proves that entries were recorded at a specific time and have
            not been altered since. It does not prove that the underlying claims
            in those entries are true. A sealed entry saying &quot;signed a $50K
            contract&quot; proves you recorded that sentence on that date — not
            that the contract exists. Attestations prove that a named person
            confirmed a statement — not that the statement is factually correct.
            Bitcoin anchoring proves the chain existed at a specific time — not
            that the contents are accurate. Do not represent Beleg records as
            legal proof, certified documents, or audited statements.
          </p>

          <h2>Your responsibilities</h2>
          <p>
            You are responsible for the accuracy of what you record. Do not use
            Beleg to create fraudulent records, impersonate others, or request
            attestations under false pretenses. Do not submit entries that
            contain illegal content, threats, or personally identifiable
            information about others without their consent.
          </p>

          <h2>Attestations</h2>
          <p>
            When you request an attestation, you are asking a real person to put
            their name on a public record. Do not request attestations from
            people who have not agreed to participate. Do not fabricate attester
            identities. Attesters confirm voluntarily and their confirmations
            cannot be retracted — they should only confirm what they know to be
            true.
          </p>

          <h2>Append-only means append-only</h2>
          <p>
            You cannot edit or delete individual entries. This is by design.
            Think before you record. If you need your entire account and all
            data deleted, contact us and we will do so within 30 days.
          </p>

          <h2>Service availability</h2>
          <p>
            Beleg is a beta product built independently. It may have
            bugs, downtime, or breaking changes. There is no uptime guarantee,
            no SLA, and no warranty of any kind. Use it knowing this.
          </p>

          <h2>Limitation of liability</h2>
          <p>
            Beleg is provided &quot;as is&quot; without warranty. We are not
            liable for any damages arising from your use of the service,
            including but not limited to: decisions made based on Beleg records,
            disputes arising from attestation content, loss of data, or service
            interruptions.
          </p>

          <h2>Termination</h2>
          <p>
            We may suspend or terminate accounts that violate these terms or use
            the service for fraud. You may stop using Beleg at any time and
            request full data deletion.
          </p>

          <h2>Changes</h2>
          <p>
            We may update these terms. Continued use after changes constitutes
            acceptance.
          </p>

          <h2>Contact</h2>
          <p>
            <a href="mailto:beleg.app@proton.me">beleg.app@proton.me</a>
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
