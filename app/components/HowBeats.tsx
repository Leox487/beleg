"use client";

import { useEffect, useState, type CSSProperties } from "react";

const BEATS = [
  {
    label: "Fingerprint",
    text: "Every entry is run through SHA-256 and comes out as a 64-character fingerprint.",
  },
  {
    label: "Chain",
    text: "Each fingerprint is built from the entry plus the fingerprint before it.",
  },
  {
    label: "Break",
    text: "Change one character in the past and every seal after it breaks at once.",
  },
  {
    label: "Anchor",
    text: "The newest seal is written into Bitcoin, where nobody can rewrite it.",
  },
  {
    label: "Verify",
    text: "Your browser redoes the math itself. It never has to trust our server.",
  },
];

const BRICKS = [
  { seq: "#01", title: "Grant received", hash: "a3f81c94b7\u2026d0e29b" },
  { seq: "#02", title: "Confirmed by Maya", hash: "7b02e9f331\u20264fc118" },
  { seq: "#03", title: "Pilot launched", hash: "c14d6a2e80\u202699e07f" },
];

const BEAT_MS = 4200;

/**
 * One continuous scene that evolves across five beats rather than five separate
 * illustrations, with a single sentence on screen at a time. Auto-advances;
 * hovering or focusing pauses it so a reader can sit on a beat.
 */
export default function HowBeats() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(
      () => setActive((a) => (a + 1) % BEATS.length),
      BEAT_MS,
    );
    return () => clearTimeout(t);
  }, [active, paused]);

  return (
    <div
      className="beats"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={`beat-stage is-beat-${active}`} aria-hidden="true">
        <div className="beat-row">
          {BRICKS.map((b) => (
            <div className="beat-brick" key={b.seq}>
              <span className="beat-seq mono">{b.seq}</span>
              <span className="beat-brick-title">{b.title}</span>
              <span className="beat-hash mono">{b.hash}</span>
            </div>
          ))}
        </div>

        <div className="beat-slot">
          <span className="beat-bubble beat-broken">
            <span className="beat-bubble-glyph">&#9888;</span>
            Chain broken at #01, and everything after it
          </span>
          <span className="beat-bubble beat-anchor">
            <span className="beat-bubble-glyph">&#9875;</span>
            Sealed into Bitcoin block 883,214
          </span>
          <span className="beat-bubble beat-verdict">
            <span className="beat-bubble-glyph">&#10003;</span>
            Chain verified &middot; 3 entries intact
          </span>
        </div>
      </div>

      <div
        className="beat-bar"
        style={{ "--active": active } as CSSProperties}
      >
        {BEATS.map((beat, i) => {
          const isActive = i === active;
          return (
            <button
              key={beat.label}
              type="button"
              className={`beat-item${isActive ? " is-active" : ""}`}
              aria-current={isActive ? "step" : undefined}
              onClick={() => setActive(i)}
              onFocus={() => {
                setPaused(true);
                setActive(i);
              }}
              onBlur={() => setPaused(false)}
            >
              <span className="beat-label">{beat.label}</span>
            </button>
          );
        })}

        <span className="beat-indicator" aria-hidden="true">
          <span
            className="beat-fill"
            key={active}
            style={{
              animationDuration: `${BEAT_MS}ms`,
              animationPlayState: paused ? "paused" : "running",
            }}
          />
        </span>
      </div>

      <p className="beat-copy" key={active}>
        {BEATS[active].text}
      </p>
    </div>
  );
}
