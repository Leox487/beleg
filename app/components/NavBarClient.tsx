"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";

import { BelegMark } from "@/app/components/BelegMark";
import { LinkPending } from "@/app/components/CtaBadge";
import { TOOL_GROUPS } from "@/lib/tools";

type UseGroup = {
  category: string;
  items: { id: string; label: string }[];
};

const HOW_IT_WORKS = [
  {
    heading: "The chain",
    links: [
      {
        href: "/how-it-works#record",
        label: "Record",
        text: "Hash and link each milestone. No edit button.",
      },
      {
        href: "/how-it-works#witness",
        label: "Witness",
        text: "The person who was there confirms in one click.",
      },
      {
        href: "/how-it-works#verify",
        label: "Verify",
        text: "The check runs in the reviewer’s browser.",
      },
      {
        href: "/how-it-works#timestamp",
        label: "Timestamp",
        text: "Pending proofs are dated on Bitcoin.",
      },
    ],
  },
  {
    heading: "Inspect it",
    links: [
      {
        href: "/verify",
        label: "Verify a ledger",
        text: "Paste a public link and recompute the seals.",
      },
      {
        href: "/how-it-works#try",
        label: "The cryptography",
        text: "Hash chains, in-browser verify, OpenTimestamps.",
      },
      {
        href: "/verify-guide",
        label: "Verify it yourself",
        text: "Walk through an intact chain, step by step.",
      },
      {
        href: "/security",
        label: "Security",
        text: "What we store, what we don’t, and what we cannot rewrite.",
      },
    ],
  },
  {
    heading: "Reviewers",
    links: [
      {
        href: "/for-reviewers",
        label: "For reviewers",
        text: "Grant officers and accelerators checking traction.",
      },
      {
        href: "/faq",
        label: "FAQ",
        text: "Short answers to the usual objections.",
      },
      {
        href: "/glossary",
        label: "Glossary",
        text: "Seal, witness, intact, broken. In plain English.",
      },
    ],
  },
];

const ABOUT = [
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About", text: "Why the ledger exists." },
      { href: "/contact", label: "Contact", text: "beleg.app@proton.me" },
    ],
  },
  {
    heading: "Trust",
    links: [
      {
        href: "/security",
        label: "Security",
        text: "What the chain defends, and what it does not.",
      },
      {
        href: "/faq",
        label: "FAQ",
        text: "Edit, shutdown, blockchain, and cost.",
      },
      {
        href: "/glossary",
        label: "Glossary",
        text: "Hash, seal, chain, genesis, anchor.",
      },
    ],
  },
  {
    heading: "Legal",
    links: [
      {
        href: "/privacy",
        label: "Privacy",
        text: "What we collect, store, and never take.",
      },
      {
        href: "/terms",
        label: "Terms",
        text: "What a sealed line proves, and what it does not.",
      },
    ],
  },
];

type Mega = "uses" | "how" | "tools" | "about" | null;

export function NavBarClient({
  signedIn,
  groups,
}: {
  signedIn: boolean;
  groups: UseGroup[];
}) {
  const [mega, setMega] = useState<Mega>(null);
  const closeTimer = useRef<number>(0);

  function open(next: Mega) {
    window.clearTimeout(closeTimer.current);
    setMega(next);
  }

  function scheduleClose() {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setMega(null), 160);
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMega(null);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <header className={`navbar${mega ? " is-mega" : ""}`}>
      <div className="navbar-bar">
        <Link href="/" className="wordmark" onClick={() => setMega(null)}>
          <BelegMark className="wordmark-mark" />
          Beleg
        </Link>

        <nav className="navbar-actions" aria-label="Main">
          <div
            className="nav-item"
            onPointerEnter={() => open("uses")}
            onPointerLeave={scheduleClose}
            onFocusCapture={() => open("uses")}
          >
            <Link
              href="/uses"
              className={`navbar-link navbar-link-info nav-link${mega === "uses" ? " is-open" : ""}`}
              aria-expanded={mega === "uses"}
              aria-haspopup="true"
            >
              Who it&apos;s for
            </Link>
          </div>

          <div
            className="nav-item"
            onPointerEnter={() => open("how")}
            onPointerLeave={scheduleClose}
            onFocusCapture={() => open("how")}
          >
            <Link
              href="/how-it-works"
              className={`navbar-link navbar-link-info nav-link${mega === "how" ? " is-open" : ""}`}
              aria-expanded={mega === "how"}
              aria-haspopup="true"
            >
              How it works
            </Link>
          </div>

          <div
            className="nav-item"
            onPointerEnter={() => open("tools")}
            onPointerLeave={scheduleClose}
            onFocusCapture={() => open("tools")}
          >
            <Link
              href="/tools"
              className={`navbar-link navbar-link-info nav-link${mega === "tools" ? " is-open" : ""}`}
              aria-expanded={mega === "tools"}
              aria-haspopup="true"
              onClick={() => setMega(null)}
            >
              Tools
            </Link>
          </div>

          <div
            className="nav-item"
            onPointerEnter={() => open("about")}
            onPointerLeave={scheduleClose}
            onFocusCapture={() => open("about")}
          >
            <Link
              href="/about"
              className={`navbar-link navbar-link-info nav-link${mega === "about" ? " is-open" : ""}`}
              aria-expanded={mega === "about"}
              aria-haspopup="true"
            >
              About
            </Link>
          </div>

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

      <div
        className={`nav-mega${mega ? " is-open" : ""}`}
        role="region"
        aria-label="Section links"
        aria-hidden={!mega}
        onPointerEnter={() => mega && open(mega)}
        onPointerLeave={scheduleClose}
      >
        {mega === "uses" ? (
          <>
            <div className="nav-mega-inner nav-mega-uses">
              {groups.map((group) => (
                <div key={group.category} className="nav-mega-col">
                  <p className="nav-mega-cat">{group.category}</p>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={`/uses#${item.id}`}
                          onClick={() => setMega(null)}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="nav-mega-foot">
              <Link href="/uses" onClick={() => setMega(null)}>
                See every situation →
              </Link>
            </p>
          </>
        ) : null}

        {mega === "how" ? (
          <div className="nav-mega-inner nav-mega-how">
            {HOW_IT_WORKS.map((col) => (
              <div key={col.heading} className="nav-mega-col">
                <p className="nav-mega-cat">{col.heading}</p>
                <ul>
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} onClick={() => setMega(null)}>
                        <strong>{link.label}</strong>
                        <span>{link.text}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null}

        {mega === "tools" ? (
          <>
            <div className="nav-mega-inner nav-mega-how">
              {TOOL_GROUPS.map((col) => (
                <div key={col.heading} className="nav-mega-col">
                  <p className="nav-mega-cat">{col.heading}</p>
                  <ul>
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <Link href={link.href} onClick={() => setMega(null)}>
                          <strong>{link.label}</strong>
                          <span>{link.text}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="nav-mega-foot">
              <Link href="/tools" onClick={() => setMega(null)}>
                See every tool →
              </Link>
            </p>
          </>
        ) : null}

        {mega === "about" ? (
          <div className="nav-mega-inner nav-mega-how">
            {ABOUT.map((col) => (
              <div key={col.heading} className="nav-mega-col">
                <p className="nav-mega-cat">{col.heading}</p>
                <ul>
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} onClick={() => setMega(null)}>
                        <strong>{link.label}</strong>
                        <span>{link.text}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </header>
  );
}
