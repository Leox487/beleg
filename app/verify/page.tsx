import type { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/app/components/Footer";
import { VerifyTool } from "@/app/components/VerifyTool";

export const metadata: Metadata = {
  title: "Verify a ledger — Beleg",
  description:
    "Paste a Beleg proof page link and verify its chain entirely in your own browser.",
};

export default function VerifyPage() {
  return (
    <main className="page">
      <div className="page-inner doc doc-narrow">
        <header className="doc-header">
          <p className="doc-eyebrow">Verification tool</p>
          <h1 className="h1 doc-title">Verify any Beleg ledger.</h1>
          <p className="doc-lead">
            Paste a public proof page URL below. Verification runs entirely in
            your browser — nothing is sent to our servers.
          </p>
        </header>

        <div className="card doc-body">
          <VerifyTool />
        </div>

        <p className="doc-note">
          You can also verify without this page. See{" "}
          <Link href="/verify-guide">Verify it yourself</Link> for the
          command-line method using open-source tools.
        </p>
      </div>

      <Footer />
    </main>
  );
}
