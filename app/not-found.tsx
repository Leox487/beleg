import Link from "next/link";

import { Footer } from "@/app/components/Footer";

export const metadata = {
  title: "Page not found · Beleg",
  description: "That URL is not on this ledger.",
};

export default function NotFound() {
  return (
    <main className="landing lp ip">
      <section className="lp-hero ip-hero lp-face-inter">
        <div className="lp-hero-wash" aria-hidden="true" />
        <div className="lp-shell">
          <p className="lp-kicker">404</p>
          <h1 className="lp-h1 ip-h1">That page is not on this ledger.</h1>
          <p className="lp-lead">
            The URL is wrong, or the record was never published. Nothing here
            was rewritten — it just does not exist.
          </p>
          <div className="lp-actions">
            <Link className="lp-btn lp-btn-primary" href="/">
              <span>Back to Beleg</span>
            </Link>
            <Link className="lp-btn lp-btn-ghost" href="/contact">
              Contact
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
