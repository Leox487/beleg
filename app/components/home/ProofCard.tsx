"use client";

import { useEffect, useRef, useState } from "react";

const HASH = "a3f81c94b7d0e29b";
const GLYPHS = "0123456789abcdef";

type Phase = "record" | "witness" | "seal" | "anchor" | "verified";

const SCRIPT: { phase: Phase; at: number }[] = [
  { phase: "record", at: 200 },
  { phase: "witness", at: 1100 },
  { phase: "seal", at: 2000 },
  { phase: "anchor", at: 3200 },
  { phase: "verified", at: 4200 },
];

function scramble(value: string, settled: number) {
  return value
    .split("")
    .map((ch, i) =>
      i < settled ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
    )
    .join("");
}

export function ProofCard() {
  const root = useRef<HTMLElement>(null);
  const [phase, setPhase] = useState<Phase>("record");
  const [hash, setHash] = useState(HASH);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("verified");
      setHash(HASH);
      return;
    }

    const timers: number[] = [];
    let hashTimer = 0;

    const run = () => {
      timers.forEach((id) => window.clearTimeout(id));
      window.clearTimeout(hashTimer);
      setPhase("record");
      setHash(HASH);

      for (const step of SCRIPT) {
        timers.push(
          window.setTimeout(() => {
            setPhase(step.phase);
            if (step.phase === "seal") {
              let frame = 0;
              const ticks = 16;
              const tick = () => {
                frame += 1;
                if (frame >= ticks) {
                  setHash(HASH);
                  return;
                }
                setHash(
                  scramble(HASH, Math.floor((frame / ticks) * HASH.length)),
                );
                hashTimer = window.setTimeout(tick, 36);
              };
              tick();
            }
          }, step.at),
        );
      }
    };

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.unobserve(el);
        run();
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      timers.forEach((id) => window.clearTimeout(id));
      window.clearTimeout(hashTimer);
    };
  }, []);

  const seen = (name: Phase) => {
    const order: Phase[] = ["record", "witness", "seal", "anchor", "verified"];
    return order.indexOf(phase) >= order.indexOf(name);
  };

  return (
    <article
      ref={root}
      className={`bh-sys is-${phase}`}
      aria-label="A Beleg proof constructing itself"
    >
      <p className="bh-sys-live">
        <i />
        Beleg / Live
      </p>
      <h2>Grant received</h2>
      <p className="bh-sys-sum">$12,000</p>
      <p className="bh-sys-who">Civic Innovation Fund</p>
      <p className="bh-sys-time">Mar 12 · 14:38:07 UTC</p>

      <ol className="bh-sys-flow">
        <li className={seen("record") ? "is-on" : undefined}>
          <span>Record</span>
          <b>Event captured</b>
        </li>
        <li className={seen("witness") ? "is-on" : undefined}>
          <span>Witness</span>
          <b>Civic Innovation Fund</b>
        </li>
        <li className={seen("seal") ? "is-on" : undefined}>
          <span>Seal</span>
          <b className="bh-hash">{hash}</b>
        </li>
        <li className={seen("anchor") ? "is-on" : undefined}>
          <span>Anchor</span>
          <b>Bitcoin block #883,214</b>
        </li>
      </ol>

      <p className={`bh-sys-end${seen("verified") ? " is-on" : ""}`}>
        {seen("verified") ? "Verified" : "Constructing proof"}
      </p>
    </article>
  );
}
