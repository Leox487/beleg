import type { Metadata } from "next";

import { ChainField } from "@/app/components/ChainField";
import { Footer } from "@/app/components/Footer";
import { ToolsDeck } from "@/app/components/ToolsDeck";

export const metadata: Metadata = {
  title: "Tools · Beleg",
  description:
    "Verify a ledger in your browser, break a chain, or read a public page the way a reviewer would.",
};

export default function ToolsPage() {
  return (
    <main className="landing lp ip">
      <section className="lp-hero ip-hero lp-face-inter">
        <ChainField />
        <div className="lp-shell">
          <p className="lp-kicker">Tools</p>
          <h1 className="lp-h1 ip-h1">Run the check. Do not take our word for it.</h1>
          <p className="lp-lead">
            Verification happens in this browser. The rest is a lab, a
            command-line walkthrough, and the pages a reviewer actually uses.
          </p>
        </div>
      </section>

      <section className="lp-section lp-face-inter">
        <div className="lp-shell">
          <ToolsDeck />
        </div>
      </section>

      <Footer />
    </main>
  );
}
