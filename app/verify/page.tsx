import type { Metadata } from "next";
import Link from "next/link";

import { BelegFooter } from "@/app/components/BelegFooter";
import { VerifyTool } from "@/app/components/VerifyTool";

export const metadata: Metadata = {
  title: "Verify a ledger · Beleg",
  description:
    "Paste a Beleg proof page link and verify its chain entirely in your own browser.",
};

export default function VerifyPage() {
  return (
    <>
      <main className="beleg-verify">
        <header className="bh-verify-head">
          <p className="bh-kicker">Verification tool</p>
          <h1 className="bh-verify-title">Verify any Beleg ledger.</h1>
          <p className="bh-body">
            Paste a public proof page URL. The check runs in this browser.
            Nothing is sent to our servers except the request to load the
            public entries.
          </p>
        </header>

        <div className="bh-verify-tool">
          <VerifyTool />
        </div>

        <p className="bh-verify-note">
          You can also verify without this page. See{" "}
          <Link href="/verify-guide">Verify it yourself</Link> for the
          command-line method using open-source tools.
        </p>
      </main>
      <BelegFooter />
    </>
  );
}
