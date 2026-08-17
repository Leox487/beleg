"use client";

import { useEffect, useRef, useState } from "react";

const PANELS = [
  {
    id: "record",
    step: "01",
    label: "Record",
    text: "Add a milestone. Beleg seals it with a timestamp and chains it to the entry before it.",
  },
  {
    id: "witness",
    step: "02",
    label: "Witness",
    text: "Send a one-click link to whoever was there. Their confirmation is sealed into the same chain.",
  },
  {
    id: "share",
    step: "03",
    label: "Share",
    text: "Share one public link. Anyone can verify the whole chain in their own browser.",
  },
];

function WindowBar({ title }: { title: string }) {
  return (
    <div className="mock-bar">
      <span className="mock-dot" />
      <span className="mock-dot" />
      <span className="mock-dot" />
      <span className="mock-bar-title">{title}</span>
    </div>
  );
}

function RecordMock() {
  return (
    <div className="mock mock-record" aria-hidden="true">
      <WindowBar title="New entry: Northstar" />
      <div className="mock-body">
        <div className="mock-row">
          <span className="mock-lbl">Kind</span>
          <span className="mock-pill">grant</span>
        </div>

        <div className="mock-row">
          <span className="mock-lbl">Title</span>
          <span className="mock-field mock-field-typing">
            <span className="mock-typed">Grant received: $12,000</span>
            <span className="mock-caret" />
          </span>
        </div>

        <div className="mock-row mock-row-detail">
          <span className="mock-lbl">Detail</span>
          <span className="mock-field">Civic Innovation Fund · Mar 12</span>
        </div>

        <div className="mock-actions">
          <span className="mock-btn">Seal entry</span>
        </div>

        <div className="mock-result">
          <span className="mock-result-dot" />
          Sealed <span className="mock-hash">a3f81c…d0e29b</span>
        </div>
      </div>
      <span className="mock-cursor mock-cursor-record" />
    </div>
  );
}

function WitnessMock() {
  return (
    <div className="mock mock-witness" aria-hidden="true">
      <WindowBar title="Confirmation request" />
      <div className="mock-body">
        <div className="mock-ref">
          <span className="mock-ref-label">You&apos;re confirming</span>
          <span className="mock-ref-title">Grant received: $12,000</span>
        </div>

        <div className="mock-who">
          <span className="mock-avatar">CIF</span>
          <span className="mock-who-meta">
            <span className="mock-who-name">Maya Chen</span>
            <span className="mock-who-role">
              Program Officer · Civic Innovation Fund
            </span>
          </span>
        </div>

        <div className="mock-quote">
          &ldquo;We awarded this grant on March 12.&rdquo;
        </div>

        <div className="mock-actions">
          <span className="mock-btn mock-btn-witness">Confirm</span>
        </div>

        <div className="mock-result mock-result-witness">
          <span className="mock-check">✓</span>
          Confirmed, sealed into the chain
        </div>
      </div>
      <span className="mock-cursor mock-cursor-witness" />
    </div>
  );
}

function ShareMock() {
  return (
    <div className="mock mock-share" aria-hidden="true">
      <WindowBar title="Public proof page" />
      <div className="mock-body">
        <div className="mock-urlbar">
          <span className="mock-url-lock">🔒</span>
          beleg.app/p/northstar
        </div>

        <div className="mock-entries">
          <span className="mock-entry">
            <b>#07</b> Grant received: $12,000
          </span>
          <span className="mock-entry">
            <b>#08</b> Confirmed by Maya Chen
          </span>
        </div>

        <div className="mock-actions">
          <span className="mock-btn mock-btn-share">Verify chain</span>
        </div>

        <div className="mock-result mock-result-share">
          <span className="mock-check">✓</span>
          Chain verified · 8 entries intact
        </div>
      </div>
      <span className="mock-cursor mock-cursor-share" />
    </div>
  );
}

const MOCKS = [<RecordMock key="r" />, <WitnessMock key="w" />, <ShareMock key="s" />];

/**
 * Vertical accordion: hover/focus/click opens one step and plays its demo.
 * The open step stays open when the pointer leaves — resetting on mouseleave
 * collapses the panel, jumps the layout, and fights the outlink below.
 */
export function Showcase() {
  const [active, setActive] = useState(0);
  const [seen, setSeen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const userTookOver = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        setSeen(true);
        if (reduce) return;
        timers.current = [
          window.setInterval(() => {
            if (!userTookOver.current) {
              setActive((i) => (i + 1) % PANELS.length);
            }
          }, 8000),
        ];
      },
      { threshold: 0.28 },
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      timers.current.forEach((id) => window.clearInterval(id));
    };
  }, []);

  const takeOver = (i: number) => {
    userTookOver.current = true;
    setActive(i);
  };

  return (
    <div className={`showcase${seen ? " is-seen" : ""}`} ref={rootRef}>
      {PANELS.map((panel, i) => {
        const isActive = i === active;
        return (
          <div key={panel.id} className="showcase-panel-wrap">
            <div
              className={`showcase-panel showcase-${panel.id} step-card${
                isActive ? " is-active" : ""
              }`}
              onMouseEnter={() => takeOver(i)}
            >
              <button
                type="button"
                className="panel-head"
                aria-expanded={isActive}
                onFocus={() => takeOver(i)}
                onClick={() => takeOver(i)}
              >
                <span className="panel-step mono">{panel.step}</span>
                <span className="panel-label">{panel.label}</span>
              </button>

              <div className="panel-reveal">
                <p className="panel-text">{panel.text}</p>
                <div className="panel-mock">{MOCKS[i]}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
