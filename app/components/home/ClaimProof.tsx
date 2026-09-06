"use client";

import { useEffect, useRef, useState } from "react";

const PIECES = [
  { label: "Event", value: "Mar 12, 2026 · 14:38:07 UTC" },
  { label: "Witness", value: "Civic Innovation Fund" },
  { label: "Hash", value: "a3f81c94b7d0e29b", mono: true },
  { label: "Chain", value: "01 → 02 → 03" },
  { label: "Anchor", value: "Bitcoin block #883,214" },
  { label: "Verified", value: "Anyone can recompute the seals" },
];

export function ClaimProof() {
  const ref = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(PIECES.length);
      return;
    }

    const nodes = [...el.querySelectorAll<HTMLElement>("[data-piece]")];
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = Number((entry.target as HTMLElement).dataset.piece);
          setStep((current) => Math.max(current, index + 1));
        }
      },
      { threshold: 0.55, rootMargin: "0px 0px -12% 0px" },
    );
    nodes.forEach((node) => obs.observe(node));
    return () => obs.disconnect();
  }, []);

  return (
    <section className="bh-band bh-claim" ref={ref}>
      <p className="bh-kicker">One claim. Six pieces of proof.</p>
      <div className="bh-claim-head">
        <h2 className="bh-h2">Grant received</h2>
        <p className="bh-claim-sum">$12,000</p>
        <p className="bh-body">March 12, 2026. Civic Innovation Fund.</p>
      </div>

      <ol className={`bh-claim-list is-${step}`}>
        {PIECES.map((piece, i) => (
          <li
            key={piece.label}
            data-piece={i}
            className={step > i ? "is-on" : undefined}
          >
            <span>{piece.label}</span>
            <b className={piece.mono ? "bh-hash" : undefined}>{piece.value}</b>
          </li>
        ))}
      </ol>
    </section>
  );
}
