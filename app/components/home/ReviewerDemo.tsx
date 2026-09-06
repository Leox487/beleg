"use client";

import { useEffect, useRef, useState } from "react";

const CHECKS = [
  "Witness confirmed",
  "Timestamp verified",
  "Chain intact",
  "Bitcoin anchor found",
];

export function ReviewerDemo() {
  const [ran, setRan] = useState(false);
  const [count, setCount] = useState(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  function verify() {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    setRan(true);
    setCount(0);
    CHECKS.forEach((_, i) => {
      timers.current.push(
        window.setTimeout(() => setCount(i + 1), 160 * (i + 1)),
      );
    });
  }

  return (
    <section id="review" className="bh-review">
      <p className="bh-kicker">For reviewers</p>
      <h2 className="bh-display">
        No account.
        <br />
        No trust required.
      </h2>
      <div className="bh-browser">
        <p className="bh-browser-bar">belegapp.com/p/civic-innovation</p>
        <div className="bh-browser-body">
          <p className={count === CHECKS.length ? "bh-ok" : "bh-accent"}>
            {count === CHECKS.length ? "Verified" : "Ready to check"}
          </p>
          <h3>Grant received</h3>
          <p>$12,000</p>
          <ul>
            {CHECKS.map((item, i) => (
              <li key={item} className={i < count ? "is-on" : undefined}>
                {i < count ? "✓" : "○"} {item}
              </li>
            ))}
          </ul>
          <button type="button" onClick={verify}>
            {ran ? "Run again" : "Verify"}
          </button>
        </div>
      </div>
    </section>
  );
}
