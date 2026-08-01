import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";

export async function Navbar() {
  const { userId } = await auth();
  const signedIn = Boolean(userId);

  return (
    <header className="navbar">
      <Link href="/" className="wordmark">
        Beleg
      </Link>

      <nav className="navbar-actions" aria-label="Main">
        <Link href="/how-it-works" className="navbar-link navbar-link-info">
          How it works
        </Link>
        <Link href="/about" className="navbar-link navbar-link-info">
          About
        </Link>

        {signedIn ? (
          <>
            <Link href="/dashboard" className="navbar-link">
              Ledgers
            </Link>
            <UserButton />
          </>
        ) : (
          <Link href="/sign-in" className="navbar-link">
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}
