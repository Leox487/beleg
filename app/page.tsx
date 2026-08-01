import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

const HOW_IT_WORKS = [
  {
    step: "01",
    label: "Record.",
    text: "Add a milestone — the system seals it with a cryptographic timestamp.",
  },
  {
    step: "02",
    label: "Witness.",
    text: "Send a one-click link to whoever was there. Their confirmation is sealed into the same chain.",
  },
  {
    step: "03",
    label: "Share.",
    text: "Send anyone your public proof page. They verify the chain independently — in their own browser.",
  },
];

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
          Applications, pitches, and grant essays are drowning in AI-polished
          claims reviewers can&apos;t verify. Beleg gives your traction a
          cryptographically sealed timeline — recorded as it happens, witnessed
          by real people, and provable to anyone reading.
        </p>

        <Link className="cta" href={signedIn ? "/dashboard" : "/sign-up"}>
          {signedIn ? "Go to your ledger" : "Start your ledger"}
        </Link>
        <p className="cta-note">
          Free while in beta. No credit card. 60 seconds to start.
        </p>

        <ul className="how-strip">
          {HOW_IT_WORKS.map((item) => (
            <li key={item.label} className="how-item">
              <span className="how-step mono">{item.step}</span>
              <span className="how-label">{item.label}</span>
              <span className="how-text">{item.text}</span>
            </li>
          ))}
        </ul>

        <p className="landing-fine">
          Anchored to Bitcoin. Verifiable without trusting this website.
        </p>
      </section>
    </main>
  );
}
