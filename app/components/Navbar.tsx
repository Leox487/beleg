import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";

import { BelegMark } from "@/app/components/BelegMark";
import { LinkPending } from "@/app/components/CtaBadge";
import { useCasesByCategory } from "@/lib/use-cases";

const HOW_IT_WORKS = [
  {
    heading: "The chain",
    links: [
      { href: "/how-it-works", label: "Record", text: "Hash and link each milestone. No edit button." },
      { href: "/how-it-works", label: "Witness", text: "The person who was there confirms in one click." },
      { href: "/how-it-works", label: "Verify", text: "The check runs in the reviewer’s browser." },
      { href: "/how-it-works", label: "Timestamp", text: "Pending proofs are dated on Bitcoin." },
    ],
  },
  {
    heading: "Inspect it",
    links: [
      { href: "/verify", label: "Verify a ledger", text: "Paste a public link and recompute the seals." },
      { href: "/how-it-works", label: "The cryptography", text: "Hash chains, in-browser verify, OpenTimestamps." },
      { href: "/verify-guide", label: "Verify it yourself", text: "Walk through an intact chain, step by step." },
      { href: "/security", label: "Security", text: "What we store, what we don’t, and what we cannot rewrite." },
    ],
  },
  {
    heading: "Reviewers",
    links: [
      { href: "/for-reviewers", label: "For reviewers", text: "Grant officers and accelerators checking traction." },
      { href: "/faq", label: "FAQ", text: "Short answers to the usual objections." },
      { href: "/glossary", label: "Glossary", text: "Seal, witness, intact, broken — in plain English." },
    ],
  },
];

export async function Navbar() {
  const { userId } = await auth();
  const signedIn = Boolean(userId);
  const grouped = useCasesByCategory();

  return (
    <header className="navbar">
      <Link href="/" className="wordmark">
        <BelegMark className="wordmark-mark" />
        Beleg
      </Link>

      <nav className="navbar-actions" aria-label="Main">
        <div className="nav-item">
          <Link href="/uses" className="navbar-link navbar-link-info nav-link">
            Who it&apos;s for
          </Link>
          <div className="nav-mega" role="region" aria-label="Who it’s for">
            <div className="nav-mega-inner nav-mega-uses">
              {Array.from(grouped.entries()).map(([category, items]) => (
                <div key={category} className="nav-mega-col">
                  <p className="nav-mega-cat">{category}</p>
                  <ul>
                    {items.map((item) => (
                      <li key={item.id}>
                        <Link href={`/uses#${item.id}`}>{item.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="nav-mega-foot">
              <Link href="/uses">See every situation →</Link>
            </p>
          </div>
        </div>

        <div className="nav-item">
          <Link
            href="/how-it-works"
            className="navbar-link navbar-link-info nav-link"
          >
            How it works
          </Link>
          <div className="nav-mega" role="region" aria-label="How it works">
            <div className="nav-mega-inner nav-mega-how">
              {HOW_IT_WORKS.map((col) => (
                <div key={col.heading} className="nav-mega-col">
                  <p className="nav-mega-cat">{col.heading}</p>
                  <ul>
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <Link href={link.href}>
                          <strong>{link.label}</strong>
                          <span>{link.text}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

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
            <Link href="/sign-up" className="navbar-signup">
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
