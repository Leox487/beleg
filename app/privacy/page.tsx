import type { Metadata } from "next";

import { Footer } from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — Beleg",
  description:
    "What data Beleg collects, why, and how it is handled — in plain English.",
};

export default function PrivacyPage() {
  return (
    <main className="page">
      <div className="page-inner doc">
        <header className="doc-header">
          <h1 className="h1 doc-title">Privacy Policy</h1>
          <p className="small">Last updated: July 31, 2026</p>
        </header>

        <div className="card doc-body">
          <p>
            Beleg is built by Leo Sun, a student developer in Philadelphia, PA.
            This policy explains what data Beleg collects, why, and how
            it&apos;s handled.
          </p>

          <h2>What we collect</h2>
          <p>
            <strong>Account information:</strong> your email address and name,
            collected through Clerk (our authentication provider) when you sign
            up.
          </p>
          <p>
            <strong>Venture data:</strong> the venture names, entry titles,
            entry bodies, dates, and hash values you create. This is the core of
            what Beleg does — recording your milestones in a sealed, append-only
            chain.
          </p>
          <p>
            <strong>Attestation data:</strong> when you request an attestation,
            we store the attester&apos;s name and email, their confirmation
            statement, and the confirmation timestamp. Attesters do not create
            accounts — their data is limited to what they provide through the
            attestation link.
          </p>
          <p>
            <strong>Anchoring data:</strong> when you anchor your ledger, we
            submit a cryptographic hash (not your content) to public Bitcoin
            timestamp servers via OpenTimestamps. The hash is a fingerprint — it
            cannot be reversed to reveal your entries.
          </p>
          <p>
            <strong>Usage data:</strong> basic server logs (page visits, errors)
            retained for debugging. We do not use analytics trackers,
            advertising pixels, or any third-party tracking scripts.
          </p>
          <p>
            <strong>What we do NOT collect:</strong> payment information,
            government IDs, phone numbers, location data, or the contents of
            your emails (the email ingestion feature, when built, will be
            covered by an updated policy before launch).
          </p>

          <h2>How data is stored</h2>
          <p>
            All data is stored in Supabase (PostgreSQL) hosted in the United
            States (us-west-1). Authentication is handled by Clerk. Both
            services maintain their own security practices and compliance
            certifications.
          </p>

          <h2>Public proof pages</h2>
          <p>
            When you create a venture on Beleg, it generates a public proof page
            at a URL you control. Anyone with that URL can view your venture
            name, tagline, entry titles, entry bodies, dates, hash values, and
            confirmed attestations. Pending attestations are never shown
            publicly. You choose what to record and when to share the link —
            Beleg does not publish or index your proof page without your action.
          </p>

          <h2>Data retention and deletion</h2>
          <p>
            Entries are append-only by design — this is a core product feature,
            not a limitation. You cannot edit or delete individual entries
            because the integrity of the chain depends on every entry remaining
            as recorded. If you want your entire venture and all its data
            permanently deleted, email{" "}
            <a href="mailto:privacy@beleg.app">privacy@beleg.app</a> (or the
            contact below) and we will delete your venture, all entries, all
            attestations, and your account within 30 days.
          </p>

          <h2>Third-party services</h2>
          <p>
            Clerk (authentication), Supabase (database), Vercel (hosting),
            OpenTimestamps (Bitcoin anchoring). We do not sell, share, or
            provide your data to any other third party.
          </p>

          <h2>Children</h2>
          <p>
            Beleg is not directed at children under 13. If you are under 13, do
            not create an account.
          </p>

          <h2>Changes</h2>
          <p>
            If this policy changes, the updated version will be posted here with
            a new &quot;Last updated&quot; date.
          </p>

          <h2>Contact</h2>
          <p>
            Leo Sun — <a href="mailto:beleg@proton.me">beleg@proton.me</a>
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
