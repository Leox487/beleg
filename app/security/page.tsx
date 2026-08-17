import type { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "Security · Beleg",
  description:
    "What Beleg protects, what it stores, where it runs, and the threats it explicitly does not defend against.",
};

export default function SecurityPage() {
  return (
    <main className="page">
      <div className="page-inner doc doc-narrow">
        <header className="doc-header">
          <p className="doc-eyebrow">Security</p>
          <h1 className="h1 doc-title">Security</h1>
          <p className="doc-lead">
            What Beleg actually defends against, and what it doesn&apos;t.
          </p>
        </header>

        <div className="card doc-body">
          <h3>What&apos;s protected, and how</h3>
          <p>
            Entries are hashed with SHA-256 and chained, so any alteration to
            past entries is detectable by anyone. Verification runs client-side,
            so you don&apos;t have to trust our server&apos;s answer. Anchored
            chains are timestamped against Bitcoin.
          </p>

          <h3>What we store</h3>
          <p>
            Your email and name (via Clerk), your venture and entry contents,
            attestation details, and anchor proofs. Full detail in the{" "}
            <Link href="/privacy">Privacy Policy</Link>.
          </p>

          <h3>Where it runs</h3>
          <p>
            Supabase (PostgreSQL, US region) for data, Clerk for authentication,
            Vercel for hosting, OpenTimestamps public calendars for anchoring.
            Row-level security is enabled; all reads and writes go through
            server routes.
          </p>

          <h3>Threat model: what Beleg defends against</h3>
          <p>
            Silent alteration of past entries, backdating entries, reordering
            history, forging a witness confirmation after the fact.
          </p>

          <h3>What Beleg does not defend against</h3>
          <p>
            Someone recording a false claim in the first place. A witness
            attesting to something untrue. Loss of your account credentials.
            Beleg proves integrity and timing, not honesty.
          </p>

          <h3>Reporting a problem</h3>
          <p>
            If you find a security issue, email{" "}
            <a href="mailto:beleg.app@proton.me">beleg.app@proton.me</a>. This is a beta
            product; responsible disclosure is genuinely appreciated.
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
