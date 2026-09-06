"use client";

import { useEffect, useRef, useState } from "react";

const STAGES = [
  { title: "Record", text: "A milestone is written. There is no edit button." },
  { title: "Witness", text: "Someone who was there confirms it. No account." },
  { title: "Seal", text: "Title, amount, and date collapse into SHA-256." },
  { title: "Timestamp", text: "Pending proofs are dated with OpenTimestamps." },
  { title: "Public proof", text: "Anyone recomputes the chain in their browser." },
];

export function HowMechanism() {
  const ref = useRef<HTMLElement>(null);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStage(STAGES.length - 1);
      return;
    }

    const timers: number[] = [];
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        STAGES.forEach((_, i) => {
          timers.push(window.setTimeout(() => setStage(i), 220 * i));
        });
      },
      { threshold: 0.35 },
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  return (
    <section id="how" className="bh-mech" ref={ref}>
      <div className="bh-mech-sticky">
        <p className="bh-kicker">How Beleg works</p>
        <p className="bh-mech-brand">Beleg</p>
        <p className="bh-mech-event">Grant received · $12,000</p>
        <ol className="bh-mech-list">
          {STAGES.map((item, i) => (
            <li key={item.title} className={i <= stage ? "is-on" : undefined}>
              <i />
              <div>
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
