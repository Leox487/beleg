import Link from "next/link";

export default function Home() {
  return (
    <main className="landing">
      <section className="landing-inner">
        <h1 className="headline">Proof, not prose.</h1>
        <p className="subline">
          Beleg is an append-only, cryptographically chained record of what your
          venture actually did — verifiable by anyone you share it with.
        </p>
        <Link className="cta" href="/sign-up">
          Start your ledger
        </Link>
      </section>
    </main>
  );
}
