import type { Metadata } from "next";

import { Footer } from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "About · Beleg",
  description:
    "Why Beleg exists: applications all sound finished now. A reviewer needs dates and confirmations that cannot be quietly rewritten.",
};

function AboutScene() {
  return (
    <div className="about-compare" aria-hidden="true">
      <div className="about-compare-col">
        <p className="about-compare-label">The essay</p>
        <ul>
          <li className="is-struck">We have strong traction this quarter</li>
          <li className="is-struck">Revenue is growing rapidly</li>
          <li className="is-dim">Clear path to product-market fit</li>
          <li className="is-dim">Experienced team executing well</li>
        </ul>
      </div>
      <div className="about-compare-col is-ledger">
        <p className="about-compare-label">The ledger</p>
        <ol>
          <li>
            <i />
            <b>#01 First customer signed</b>
            <em>SEAL</em>
          </li>
          <li>
            <i />
            <b>#02 Confirmed by ops lead</b>
            <em>OK</em>
          </li>
          <li>
            <i />
            <b>beleg.app/p/northstar</b>
            <em>LIVE</em>
          </li>
        </ol>
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <main className="landing lp ip">
      <section className="lp-hero ip-hero lp-face-jakarta">
        <div className="lp-hero-wash" aria-hidden="true" />
        <div className="lp-shell">
          <p className="lp-kicker">About</p>
          <h1 className="lp-h1 ip-h1">A record nobody can quietly rewrite.</h1>
          <p className="lp-lead">
            Beleg is German for proof, or receipt. Applications all sound
            finished now. This is a place for dates and confirmations that
            cannot be edited later.
          </p>
        </div>
      </section>

      <section className="lp-section ip-section lp-face-jakarta">
        <div className="lp-shell">
          <AboutScene />
          <div className="lp-honest">
            <div className="lp-honest-col">
              <p className="lp-honest-label">What it holds</p>
              <p className="lp-body">
                The words you recorded, the order, the dates, who confirmed an
                entry, and when that confirmation was sealed.
              </p>
            </div>
            <div className="lp-honest-col">
              <p className="lp-honest-label">What it does not</p>
              <p className="lp-body">
                Whether the work was good. Whether a witness is telling the
                truth about the world. The chain only stops anyone, including
                you, from rewriting the history later.
              </p>
            </div>
          </div>
          <p className="lp-body ip-note">
            Beleg is in beta, and free. If something breaks, email{" "}
            <a href="mailto:beleg.app@proton.me">beleg.app@proton.me</a>.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
