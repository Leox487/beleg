"use client";

import { useEffect, useRef, useState } from "react";

const PARTS = [
  { label: "Event", value: "Mar 12, 2026" },
  { label: "Witness", value: "Civic Innovation Fund" },
  { label: "Time", value: "14:38:07 UTC" },
  { label: "Seal", value: "a3f81c94b7d0e29b" },
  { label: "Previous", value: "7b02e9f3314fc118" },
  { label: "Anchor", value: "Bitcoin block #883,214" },
];

export function ClaimIdea() {
  const ref = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReady(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        setReady(true);
      },
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="idea" className={`bh-idea${ready ? " is-ready" : ""}`} ref={ref}>
      <p className="bh-kicker">The idea</p>
      <h2 className="bh-idea-title">A claim is not proof.</h2>
      <p className="bh-idea-quote">“I received a $12,000 grant.”</p>
      <p className="bh-idea-tag">Claim</p>

      <ol className="bh-idea-parts">
        {PARTS.map((part) => (
          <li key={part.label}>
            <span>{part.label}</span>
            <b>{part.value}</b>
          </li>
        ))}
      </ol>

      <p className="bh-idea-end">Now someone else can verify it.</p>
    </section>
  );
}
