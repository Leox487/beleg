import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";

import { BelegMark } from "@/app/components/BelegMark";
import { LinkPending } from "@/app/components/CtaBadge";

export async function Navbar() {
  const { userId } = await auth();
  const signedIn = Boolean(userId);

  return (
    <header className="navbar">
      <Link href="/" className="wordmark">
        <BelegMark className="wordmark-mark" />
        Beleg
      </Link>

      <nav className="navbar-actions" aria-label="Main">
        <Link href="/uses" className="navbar-link navbar-link-info nav-link">
          Who it&apos;s for
        </Link>
        <Link href="/how-it-works" className="navbar-link navbar-link-info nav-link">
          How it works
        </Link>
        <Link href="/about" className="navbar-link navbar-link-info nav-link">
          About
        </Link>

        {signedIn ? (
          <>
            <Link href="/dashboard" className="navbar-link">
              Ledgers
              <LinkPending />
            </Link>
            <UserButton />
          </>
        ) : (
          <>
            <Link href="/sign-in" className="navbar-link navbar-login">
              Log in
            </Link>
            <Link href="/sign-up" className="btn btn-primary navbar-signup">
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
