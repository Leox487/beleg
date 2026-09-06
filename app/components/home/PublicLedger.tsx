"use client";

import { useState } from "react";

const ENTRIES = [
  { n: "01", title: "Grant received", detail: "$12,000", who: "Civic Innovation Fund", date: "Mar 12" },
  { n: "02", title: "Confirmed", detail: "Maya Chen", who: "Civic Innovation Fund", date: "Mar 12" },
  { n: "03", title: "Pilot launched", detail: "3 clinics", who: "Northstar", date: "Apr 02" },
  { n: "04", title: "Usage milestone", detail: "147 users", who: "Product analytics", date: "Apr 18" },
];

export function PublicLedger() {
  const [active, setActive] = useState("01");
  const current = ENTRIES.find((e) => e.n === active) ?? ENTRIES[0];

  return (
    <section id="public" className="bh-pub">
      <div className="bh-pub-copy">
        <p className="bh-kicker">Public proof</p>
        <h2 className="bh-display">Don&apos;t take our word for it.</h2>
      </div>
      <div className="bh-pub-app">
        <div>
          <p className="bh-pub-name">Project / Civic Innovation</p>
          <ol>
            {ENTRIES.map((entry) => (
              <li key={entry.n}>
                <button
                  type="button"
                  className={active === entry.n ? "is-on" : undefined}
                  onClick={() => setActive(entry.n)}
                >
                  <span>{entry.n}</span>
                  <strong>{entry.title}</strong>
                  <em>{entry.detail}</em>
                  <small>{entry.date}</small>
                </button>
              </li>
            ))}
          </ol>
        </div>
        <aside>
          <p>Selected record</p>
          <ul>
            <li>{current.title}</li>
            <li>{current.detail}</li>
            <li>{current.who}</li>
            <li>{current.date}</li>
          </ul>
          <p>Chain status</p>
          <ul>
            <li>4 / 4 records intact</li>
            <li>1 witness confirmed</li>
            <li>Bitcoin #883,214</li>
          </ul>
          <p>
            Open <a href="/verify">Verify</a> to recompute a real ledger.
          </p>
        </aside>
      </div>
    </section>
  );
}
