"use client";

import { useEffect, useRef, useState } from "react";

const HASH = "a3f81c94b7d0e29b";
const GLYPHS = "0123456789abcdef";

type Phase = "idle" | "sealed" | "witness" | "hash" | "chain" | "anchor" | "locked";

const SCRIPT: { phase: Phase; at: number }[] = [
  { phase: "sealed", at: 180 },
  { phase: "witness", at: 820 },
  { phase: "hash", at: 1480 },
  { phase: "chain", at: 2280 },
  { phase: "anchor", at: 3780 },
  { phase: "locked", at: 4580 },
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
  const [phase, setPhase] = useState<Phase>("sealed");
  const [hash, setHash] = useState(HASH);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("locked");
      setHash(HASH);
      return;
    }

    const timers: number[] = [];
    let hashTimer = 0;

    const run = () => {
      timers.forEach((id) => window.clearTimeout(id));
      window.clearTimeout(hashTimer);
      setPhase("idle");
      setHash(scramble(HASH, 0));

      for (const step of SCRIPT) {
        timers.push(
          window.setTimeout(() => {
            setPhase(step.phase);
            if (step.phase === "hash") {
              let frame = 0;
              const ticks = 16;
              const tick = () => {
                frame += 1;
                if (frame >= ticks) {
                  setHash(HASH);
                  return;
                }
                setHash(scramble(HASH, Math.floor((frame / ticks) * HASH.length)));
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
      { threshold: 0.35 },
    );
    obs.observe(el);

    return () => {
      obs.disconnect();
      timers.forEach((id) => window.clearTimeout(id));
      window.clearTimeout(hashTimer);
    };
  }, []);

  const live = phase !== "idle";
  const seen = (name: Phase) =>
    ["idle", "sealed", "witness", "hash", "chain", "anchor", "locked"].indexOf(phase) >=
    ["idle", "sealed", "witness", "hash", "chain", "anchor", "locked"].indexOf(name);

  return (
    <article
      ref={root}
      className={`bh-doc is-${phase}`}
      aria-label="A Beleg record being sealed and verified"
    >
      <header className="bh-doc-head">
        <span>01</span>
        <span className={seen("witness") ? "bh-ok" : undefined}>
          {seen("witness") ? "Verified ●" : "Mar 14, 2026"}
        </span>
      </header>

      <h2>Grant received</h2>
      <p className="bh-doc-sum">$12,000</p>
      <p className="bh-doc-who">Civic Innovation Fund</p>

      <dl className="bh-doc-facts">
        <div className={seen("sealed") ? "is-on" : undefined}>
          <dt>Event</dt>
          <dd>Mar 12, 2026 · 14:38:07 UTC</dd>
        </div>
        <div className={seen("witness") ? "is-on" : undefined}>
          <dt>Witness</dt>
          <dd>Civic Innovation Fund</dd>
        </div>
        <div className={seen("hash") ? "is-on" : undefined}>
          <dt>Hash</dt>
          <dd className="bh-hash">{hash}</dd>
        </div>
        <div className={seen("anchor") ? "is-on" : undefined}>
          <dt>Bitcoin</dt>
          <dd>Block #883,214</dd>
        </div>
      </dl>

      <p className={`bh-doc-spine${seen("chain") ? " is-on" : ""}`} aria-hidden="true">
        <span className={seen("chain") ? "is-on" : undefined}>01</span>
        <i />
        <span className={seen("chain") ? "is-on" : undefined}>02</span>
        <i />
        <span className={seen("anchor") ? "is-on" : undefined}>03</span>
      </p>

      <footer className="bh-doc-foot">
        <b>
          <span className="bh-dot" />
          {phase === "locked" ? "Locked" : live && seen("witness") ? "Sealed" : "Sealed"}
        </b>
        <span>{seen("anchor") ? "Block #883,214" : "SHA-256"}</span>
      </footer>
    </article>
  );
}
