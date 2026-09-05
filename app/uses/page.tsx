import type { Metadata } from "next";

import { Footer } from "@/app/components/Footer";
import { LimitPanel } from "@/app/components/LimitPanel";
import { UseExplorer } from "@/app/components/UseExplorer";
import { USE_CASES } from "@/lib/use-cases";

export const metadata: Metadata = {
  title: "Who Beleg is for",
  description:
    "Founders, contractors, freelancers, researchers, students, and consultants. Pick a profession and see the first entry you would seal, who confirms it, and where the link goes.",
};

export default function UsesPage() {
  return (
    <main className="landing lp ip">
      <section className="lp-hero ip-hero lp-face-jakarta">
        <div className="lp-hero-wash" aria-hidden="true" />
        <div className="lp-shell">
          <p className="lp-kicker">Who it is for</p>
          <h1 className="lp-h1 ip-h1">
            Work a stranger has to take on trust.
          </h1>
          <p className="lp-lead">
            Pick a profession. You will see the first entry you would seal, who
            confirms it, and where the public link goes. {USE_CASES.length}{" "}
            cases where that helps, and a short list of where it does not.
          </p>
          <UseExplorer />
        </div>
      </section>

      <section className="lp-section ip-section lp-face-jakarta">
        <div className="lp-shell">
          <p className="lp-eyebrow">Where it does not help</p>
          <LimitPanel />
        </div>
      </section>

      <Footer />
    </main>
  );
}
