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
  const [step, setStep] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(PARTS.length);
      return;
    }
    const items = [...el.querySelectorAll<HTMLElement>("[data-part]")];
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const part = Number((entry.target as HTMLElement).dataset.part);
          setStep((n) => Math.max(n, part + 1));
        }
      },
      { threshold: 0.5, rootMargin: "0px 0px -10% 0px" },
    );
    items.forEach((item) => obs.observe(item));
    return () => obs.disconnect();
  }, []);

  return (
    <section id="idea" className="bh-idea" ref={ref}>
      <p className="bh-kicker">The idea</p>
      <h2 className="bh-idea-title">A claim is not proof.</h2>
      <p className="bh-idea-quote">“I received a $12,000 grant.”</p>
      <p className="bh-idea-tag">Claim</p>

      <ol className="bh-idea-parts">
        {PARTS.map((part, i) => (
          <li
            key={part.label}
            data-part={i}
            className={step > i ? "is-on" : undefined}
          >
            <span>{part.label}</span>
            <b>{part.value}</b>
          </li>
        ))}
      </ol>

      <p className={`bh-idea-end${step >= PARTS.length ? " is-on" : ""}`}>
        Now someone else can verify it.
      </p>
    </section>
  );
}
