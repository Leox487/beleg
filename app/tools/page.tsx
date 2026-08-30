import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

import { ChainField } from "@/app/components/ChainField";
import { CtaBadge } from "@/app/components/CtaBadge";
import { Footer } from "@/app/components/Footer";
import { ToolsDeck } from "@/app/components/ToolsDeck";

export const metadata: Metadata = {
  title: "Tools · Beleg",
  description:
    "Verify a ledger in your browser, break a chain, or read a public page the way a reviewer would.",
};

export default async function ToolsPage() {
  const { userId } = await auth();
  const signedIn = Boolean(userId);
  const ctaHref = signedIn ? "/dashboard" : "/sign-up";
  const ctaLabel = signedIn ? "Go to your ledger" : "Start a ledger";

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

      <section className="lp-section lp-cta lp-face-inter">
        <div className="lp-shell lp-cta-inner">
          <h2 className="lp-h2 lp-cta-title">
            Start a ledger. Share the link when someone asks you to prove it.
          </h2>
          <div className="lp-actions">
            <Link className="lp-btn lp-btn-primary" href={ctaHref}>
              <span>{ctaLabel}</span>
              <CtaBadge />
            </Link>
            <Link className="lp-btn lp-btn-ghost" href="/how-it-works">
              See how the seals work
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
