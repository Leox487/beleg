"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Full-width product cinema. A cursor walks the Beleg loop:
 * type a grant, seal it, confirm it, verify the chain.
 * Decorative. The real tools live at /tools and /verify.
 */
export function LedgerCinema() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setOn(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        setOn(true);
      },
      { threshold: 0.22 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      className={`cinema${on ? " is-on" : ""}`}
      aria-hidden="true"
    >
      <div className="cinema-chrome">
        <span className="cinema-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="cinema-url">
          <em>🔒</em>
          beleg.app/p/northstar
        </span>
        <span className="cinema-chip">
          <b className="cinema-chip-a">Recording</b>
          <b className="cinema-chip-b">Sealed</b>
          <b className="cinema-chip-c">Witnessed</b>
          <b className="cinema-chip-d">Intact</b>
        </span>
      </div>

      <div className="cinema-stage">
        <div className="cinema-compose">
          <p className="cinema-kicker">New entry</p>
          <div className="cinema-field">
            <span>Kind</span>
            <strong>grant</strong>
          </div>
          <div className="cinema-field cinema-field-title">
            <span>Title</span>
            <strong>
              <em className="cinema-typed">Grant received: $12,000</em>
            </strong>
          </div>
          <div className="cinema-btn cinema-btn-seal">Seal entry</div>
          <div className="cinema-witness">
            <p>Maya Chen · Civic Innovation Fund</p>
            <p>&ldquo;We awarded this grant on March 12.&rdquo;</p>
            <div className="cinema-btn cinema-btn-ok">Confirm</div>
          </div>
        </div>

        <div className="cinema-chain">
          <p className="cinema-kicker">Public chain</p>
          <ol>
            <li className="cinema-row cinema-row-1">
              <i />
              <b>#06</b>
              <span>Pilot launched with 3 clinics</span>
              <em>SEAL c14d6a</em>
            </li>
            <li className="cinema-row cinema-row-2">
              <i />
              <b>#07</b>
              <span>Grant received: $12,000</span>
              <em>SEAL a3f81c</em>
            </li>
            <li className="cinema-row cinema-row-3">
              <i />
              <b>#08</b>
              <span>Confirmed by Maya Chen</span>
              <em>SEAL 7b02e9</em>
            </li>
          </ol>
          <div className="cinema-banner">
            <span>✓</span>
            Chain verified · 8 entries intact
          </div>
          <div className="cinema-btc">
            <span>⚓</span>
            Anchored to Bitcoin block #883,214
          </div>
        </div>
      </div>

      <span className="cinema-cursor" />
    </div>
  );
}
