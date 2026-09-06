import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

import { HomeStory } from "@/app/components/home/HomeStory";
import { DEFAULT_DESCRIPTION } from "@/lib/site";

export const metadata: Metadata = {
  title: "Beleg. Proof, not prose.",
  description: DEFAULT_DESCRIPTION,
};

export default async function Home() {
  const { userId } = await auth();
  const signedIn = Boolean(userId);

  return (
    <>
      <HomeStory
        ctaHref={signedIn ? "/dashboard" : "/sign-up"}
        ctaLabel={signedIn ? "Open your ledger" : "Create a Beleg"}
      />
      <footer className="bh-footer">
        <p className="bh-footer-word">Beleg</p>
        <p className="bh-footer-tag">A permanent record for things that matter.</p>
        <nav className="bh-footer-nav" aria-label="Footer">
          <Link href="/#record">Product</Link>
          <Link href="/verify">Verify</Link>
          <Link href="/#about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <p className="bh-footer-est">Est. 2026</p>
      </footer>
    </>
  );
}
