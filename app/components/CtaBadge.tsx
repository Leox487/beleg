"use client";

import { useLinkStatus } from "next/link";

/**
 * Swaps the arrow for a spinner while the parent <Link> navigation is in
 * flight, so a click on a slow dynamic route gets acknowledged immediately.
 * Must be rendered inside a <Link>.
 */
export function CtaBadge() {
  const { pending } = useLinkStatus();

  return (
    <span
      className={`cta-badge${pending ? " is-pending" : ""}`}
      aria-hidden="true"
    >
      <span className="cta-arrow">→</span>
      <span className="cta-spinner" />
    </span>
  );
}

/** Small inline dot for text links (navbar). */
export function LinkPending() {
  const { pending } = useLinkStatus();
  return (
    <span aria-hidden className={`link-hint${pending ? " is-pending" : ""}`} />
  );
}
