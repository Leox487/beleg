"use client";

import { useState } from "react";

const ROWS = [
  {
    n: "01",
    title: "Grant received",
    detail: "$12,000",
    who: "Civic Innovation Fund",
    state: "VERIFIED",
    proof: "Witnessed and anchored to Bitcoin #883,214.",
  },
  {
    n: "02",
    title: "Pilot launched",
    detail: "3 clinics",
    who: "Northstar",
    state: "WITNESSED",
    proof: "Maya Chen confirmed the launch. Seal is on the chain.",
  },
  {
    n: "03",
    title: "Partnership signed",
    detail: "Clinic network",
    who: "Northstar partners",
    state: "SEALED",
    proof: "SHA-256 seal holds. Previous hash points to record 02.",
  },
  {
    n: "04",
    title: "First users",
    detail: "147",
    who: "Product analytics",
    state: "TIMESTAMPED",
    proof: "OpenTimestamps dated this entry. The chain is intact.",
  },
];

export function LedgerStream() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section id="live" className="bh-stream">
      <p className="bh-kicker">Every claim leaves a trace.</p>
      <ul className="bh-stream-track">
        {ROWS.map((row) => (
          <li key={row.n}>
            <button
              type="button"
              className={open === row.n ? "is-open" : undefined}
              aria-expanded={open === row.n}
              onClick={() => setOpen((n) => (n === row.n ? null : row.n))}
            >
              <span>{row.n}</span>
              <strong>{row.title}</strong>
              <em>{row.detail}</em>
              <small>{row.who}</small>
              <b className={row.state === "VERIFIED" ? "bh-ok" : "bh-accent"}>
                {row.state}
              </b>
            </button>
            {open === row.n ? <p>{row.proof}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
