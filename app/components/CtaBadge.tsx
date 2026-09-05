"use client";

import { useLinkStatus } from "next/link";

/**
 * Plain → glyph that swaps for a spinner while the parent <Link> is pending.
 * Must be rendered inside a <Link>.
 */
export function CtaBadge() {
  const { pending } = useLinkStatus();

  return (
    <span
      className={`cta-arrow-wrap${pending ? " is-pending" : ""}`}
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
