import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";

export async function Navbar() {
  const { userId } = await auth();
  const signedIn = Boolean(userId);

  return (
    <header className="navbar">
      <Link href={signedIn ? "/dashboard" : "/"} className="wordmark">
        Beleg
      </Link>

      <nav className="navbar-actions" aria-label="Main">
        {signedIn ? (
          <UserButton />
        ) : (
          <Link href="/sign-in" className="navbar-link">
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}
