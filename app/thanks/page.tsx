import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

import { Footer } from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "Thank you · Beleg",
  description: "Your confirmation or account is recorded.",
  robots: { index: false, follow: false },
};

export default async function ThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  const { userId } = await auth();
  const witness = from === "witness";

  return (
    <main className="landing lp ip">
      <section className="lp-hero ip-hero lp-face-inter">
        <div className="lp-hero-wash" aria-hidden="true" />
        <div className="lp-shell">
          <p className="lp-kicker">Recorded</p>
          <h1 className="lp-h1 ip-h1">
            {witness ? "Thank you. The confirmation is sealed." : "You're in."}
          </h1>
          <p className="lp-lead">
            {witness
              ? "Your name is now on the public proof page with the entry you confirmed. Nothing more to do."
              : userId
                ? "Your account is ready. Seals show the words were not rewritten here. They do not prove an event is true, and they are not funding or legal evidence."
                : "If you just confirmed a record, it is on the chain. If you meant to open a ledger, sign in."}
          </p>
          <div className="lp-actions">
            {witness ? (
              <Link className="lp-btn lp-btn-primary" href="/">
                <span>Back to Beleg</span>
              </Link>
            ) : userId ? (
              <Link className="lp-btn lp-btn-primary" href="/dashboard">
                <span>Go to your ledger</span>
              </Link>
            ) : (
              <Link className="lp-btn lp-btn-primary" href="/sign-in">
                <span>Sign in</span>
              </Link>
            )}
            <Link className="lp-btn lp-btn-ghost" href="/how-it-works">
              How it works
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
