"use client";

import { useState, type ReactNode } from "react";

/**
 * Replaces <details>, which cannot animate its own open/close. The panel uses
 * a 0fr -> 1fr grid row so the height transition works without measuring.
 */
export default function Accordion({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`acc${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="acc-summary"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="acc-title">{title}</span>
        <span className="acc-icon" aria-hidden="true" />
      </button>

      <div className="acc-panel">
        <div className="acc-panel-inner">
          <div className="acc-body">{children}</div>
        </div>
      </div>
    </div>
  );
}
