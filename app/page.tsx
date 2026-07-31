import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  // Branch the CTA on auth state. A signed-in visitor sent to /sign-up gets
  // bounced back to / by Clerk (active session), which looked like the button
  // "just refreshing". Signed-in users go straight to the dashboard instead.
  const { userId } = await auth();
  const signedIn = Boolean(userId);

  return (
    <main className="landing">
      <section className="landing-inner">
        <h1 className="headline">Proof, not prose.</h1>
        <p className="subline">
          Beleg is an append-only, cryptographically chained record of what your
          venture actually did — verifiable by anyone you share it with.
        </p>
        <Link className="cta" href={signedIn ? "/dashboard" : "/sign-up"}>
          {signedIn ? "Go to your ledger" : "Start your ledger"}
        </Link>
      </section>
    </main>
  );
}
