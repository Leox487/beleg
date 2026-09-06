import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";

import { BelegFooter } from "@/app/components/BelegFooter";
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
        ctaLabel={signedIn ? "Open your ledger" : "Create a ledger"}
      />
      <BelegFooter />
    </>
  );
}
