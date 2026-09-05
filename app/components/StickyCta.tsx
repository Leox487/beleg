"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

const HIDE = [
  /^\/dashboard/,
  /^\/v\//,
  /^\/p\//,
  /^\/attest\//,
  /^\/sign-in/,
  /^\/sign-up/,
  /^\/thanks/,
];

export function StickyCta() {
  const pathname = usePathname() ?? "/";
  const { isSignedIn } = useAuth();
  const hidden = HIDE.some((re) => re.test(pathname));
  const href = isSignedIn ? "/dashboard" : "/sign-up";
  const label = isSignedIn ? "Go to your ledger" : "Get started";

  useEffect(() => {
    const on = !hidden;
    document.body.classList.toggle("has-sticky-cta", on);
    return () => document.body.classList.remove("has-sticky-cta");
  }, [hidden]);

  if (hidden) return null;

  return (
    <div className="sticky-cta">
      <Link className="sticky-cta-btn" href={href}>
        {label}
      </Link>
    </div>
  );
}
