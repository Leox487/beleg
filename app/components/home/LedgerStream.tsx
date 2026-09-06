"use client";

import { useEffect, useRef, useState } from "react";

const ROWS = [
  {
    n: "01",
    title: "Grant received",
    detail: "$12,000",
    who: "Civic Innovation Fund",
    state: "VERIFIED",
  },
  {
    n: "02",
    title: "Pilot launched",
    detail: "3 clinics",
    who: "Northstar",
    state: "WITNESSED",
  },
  {
    n: "03",
    title: "Partnership signed",
    detail: "Clinic network",
    who: "Northstar partners",
    state: "SEALED",
  },
  {
    n: "04",
    title: "First users",
    detail: "147",
    who: "Product analytics",
    state: "TIMESTAMPED",
  },
];

export function LedgerStream() {
  const pin = useRef<HTMLElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const section = pin.current;
    const row = track.current;
    if (!section || !row) return;

    const update = () => {
      const rect = section.getBoundingClientRect();
      const travel = section.offsetHeight - window.innerHeight;
      if (travel <= 0) return;
      const progress = Math.min(
        1,
        Math.max(0, -rect.top / travel),
      );
      const max = row.scrollWidth - window.innerWidth + 56;
      row.style.transform = `translate3d(${-progress * Math.max(0, max)}px,0,0)`;
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <section id="live" className="bh-stream" ref={pin}>
      <div className="bh-stream-sticky">
        <p className="bh-kicker">Every claim leaves a trace.</p>
        <ul className="bh-stream-track" ref={track}>
          {ROWS.map((row) => (
            <li key={row.n}>
              <button
                type="button"
                className={open === row.n ? "is-open" : undefined}
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
              {open === row.n ? (
                <p>
                  Record {row.n} is on the chain. Click another row, or keep
                  scrolling.
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
