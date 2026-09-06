"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

import { BelegMark } from "@/app/components/BelegMark";
import { CtaBadge, LinkPending } from "@/app/components/CtaBadge";

export function NavBarClient({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="navbar">
      <div className="navbar-bar">
        <Link href="/" className="wordmark">
          <BelegMark className="wordmark-mark" />
          Beleg
        </Link>

        <nav className="navbar-center" aria-label="Main">
          <a href="/#record" className="navbar-link navbar-link-info">
            Product
          </a>
          <Link href="/verify" className="navbar-link navbar-link-info">
            Verify
          </Link>
          <a href="/#about" className="navbar-link navbar-link-info">
            About
          </a>
        </nav>

        <nav className="navbar-end" aria-label="Account">
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
              <Link href="/sign-up" className="navbar-signup">
                Create a Beleg
                <CtaBadge />
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
