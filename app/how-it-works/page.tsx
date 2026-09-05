import type { Metadata } from "next";

import ChainLab from "@/app/components/ChainLab";
import { Footer } from "@/app/components/Footer";
import { HowFacts } from "@/app/components/HowFacts";

export const metadata: Metadata = {
  title: "How Beleg Works · Beleg",
  description:
    "Hash chains, in-browser verification, witness confirmations, and Bitcoin timestamps, in plain English.",
};

export default function HowItWorksPage() {
  return (
    <main className="landing lp ip">
      <section className="lp-hero ip-hero lp-face-grotesk">
        <div className="lp-hero-wash" aria-hidden="true" />
        <div className="lp-shell ip-anchor" id="try">
          <p className="lp-kicker">How it works</p>
          <h1 className="lp-h1 ip-h1">A chain you can break on this page.</h1>
          <p className="lp-lead">
            These are real SHA-256 seals, computed in your browser. Change one
            character in entry #1 and every seal after it fails.
          </p>
          <div className="ip-lab">
            <ChainLab />
          </div>
        </div>
      </section>

      <section className="lp-section ip-section lp-face-grotesk">
        <div className="lp-shell">
          <HowFacts />
          <p className="lp-body ip-note ip-anchor" id="limits">
            A sealed line proves when you wrote it, and that it has not changed.
            It does not prove the event is true. Witnesses and evidence do that.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
