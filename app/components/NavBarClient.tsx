"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

import { BelegMark } from "@/app/components/BelegMark";
import { LinkPending } from "@/app/components/CtaBadge";

const LINKS = [
  { id: "how", label: "How it works" },
  { id: "uses", label: "Who it's for" },
  { id: "tools", label: "Tools" },
  { id: "about", label: "About" },
] as const;

export function NavBarClient({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="navbar">
      <div className="navbar-bar">
        <Link href="/" className="wordmark">
          <BelegMark className="wordmark-mark" />
          Beleg
        </Link>

        <nav className="navbar-center" aria-label="Main">
          {LINKS.map((link) => (
            <a
              key={link.id}
              href={`/#${link.id}`}
              className="navbar-link navbar-link-info"
            >
              {link.label}
            </a>
          ))}
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
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
