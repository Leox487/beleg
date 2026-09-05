"use client";

import { useState } from "react";

const LIMITS = [
  {
    id: "license",
    title: "Licensed trades and clinicians",
    text: "A state board lookup already answers the question.",
    scene: "The license is already a public record. Beleg would be a copy of a copy.",
  },
  {
    id: "register",
    title: "Public registers",
    text: "Court filings, permits, inspection scores, property sales.",
    scene: "If a stranger can pull the docket, they do not need a sealed diary of it.",
  },
  {
    id: "audience",
    title: "Public audience numbers",
    text: "Subscriber counts the sponsor can already read off the page.",
    scene: "The platform publishes the count. Pasting it into a ledger adds no new fact.",
  },
  {
    id: "audit",
    title: "Audited financials",
    text: "A lender wants tax returns and bank statements.",
    scene: "A sealed sentence is not a 1040. Send the document they asked for.",
  },
  {
    id: "nda",
    title: "Confidential client outcomes",
    text: "Asking a client to confirm in public is often the wrong move.",
    scene: "A witness who cannot speak in public is not a witness you should request.",
  },
] as const;

const BARS = [
  { label: "NSF proposals reviewed", value: 40000, display: "40,000" },
  { label: "NSF awards funded", value: 11000, display: "11,000" },
  { label: "GRFP applications reviewed", value: 12500, display: "12,500+" },
] as const;

function Cursor() {
  return (
    <span className="limit-cursor" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path
          d="M5 2.5 L5 18.5 L9.2 14.4 L12 20.5 L14.4 19.4 L11.6 13.5 L17.4 13.2 Z"
          fill="#0b1512"
          stroke="#ffffff"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function Scene({ id }: { id: (typeof LIMITS)[number]["id"] }) {
  if (id === "license") {
    return (
      <div className="limit-mock" aria-hidden="true">
        <div className="limit-mock-bar">PA Department of State</div>
        <div className="limit-mock-row">
          <span>License lookup</span>
          <b>Chen, Maya · RN</b>
        </div>
        <button type="button" className="limit-mock-btn" tabIndex={-1}>
          Search
        </button>
        <div className="limit-mock-hit">
          Active · License #RN-48219 · expires 2027
        </div>
        <Cursor />
      </div>
    );
  }

  if (id === "register") {
    return (
      <div className="limit-mock" aria-hidden="true">
        <div className="limit-mock-bar">Public docket</div>
        <div className="limit-mock-row">
          <span>Case</span>
          <b>CV-2024-1184</b>
        </div>
        <div className="limit-mock-row">
          <span>Filed</span>
          <b>12 Mar 2024 · already public</b>
        </div>
        <div className="limit-mock-hit">PDF on the court site. No seal needed.</div>
        <Cursor />
      </div>
    );
  }

  if (id === "audience") {
    return (
      <div className="limit-mock" aria-hidden="true">
        <div className="limit-mock-bar">Channel</div>
        <div className="limit-spark" aria-hidden="true">
          <i style={{ height: "28%" }} />
          <i style={{ height: "46%" }} />
          <i style={{ height: "38%" }} />
          <i style={{ height: "72%" }} />
          <i style={{ height: "64%" }} />
          <i style={{ height: "88%" }} />
          <i style={{ height: "80%" }} />
        </div>
        <div className="limit-mock-row">
          <span>Subscribers</span>
          <b>124,802 · live on the page</b>
        </div>
        <Cursor />
      </div>
    );
  }

  if (id === "audit") {
    return (
      <div className="limit-mock" aria-hidden="true">
        <div className="limit-stack" aria-hidden="true">
          <span>Form 1040</span>
          <span>Bank statement</span>
          <span>Reviewed financials</span>
        </div>
        <div className="limit-mock-hit">The lender asked for the file, not a sentence.</div>
        <Cursor />
      </div>
    );
  }

  return (
    <div className="limit-mock" aria-hidden="true">
      <div className="limit-mock-bar">Witness link</div>
      <div className="limit-dialog">
        <p>“I can’t put my name on a public page for this client.”</p>
        <span>Request declined</span>
      </div>
      <Cursor />
    </div>
  );
}

export function LimitPanel() {
  const [selected, setSelected] = useState<(typeof LIMITS)[number]["id"]>(
    "license",
  );
  const active = LIMITS.find((item) => item.id === selected) ?? LIMITS[0];
  const max = Math.max(...BARS.map((bar) => bar.value));

  return (
    <div className="limit-split">
      <ul className="limit-list">
        {LIMITS.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`limit-item${item.id === selected ? " is-on" : ""}`}
              aria-pressed={item.id === selected}
              onClick={() => setSelected(item.id)}
            >
              <strong>{item.title}</strong>
              <span>{item.text}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="limit-stage">
        <p className="limit-scene-kicker">Already answered</p>
        <Scene id={active.id} />
        <p className="limit-scene-note">{active.scene}</p>

        <div className="limit-stats">
          <p className="limit-stats-kicker">What a reviewer is actually sorting</p>
          <ul>
            {BARS.map((bar) => (
              <li key={bar.label}>
                <span>{bar.label}</span>
                <b>{bar.display}</b>
                <i style={{ width: `${(bar.value / max) * 100}%` }} />
              </li>
            ))}
          </ul>
          <p className="limit-source">
            NSF FY 2024 Agency Financial Report: 40,000 proposals evaluated,
            11,000 funded, 187,829 reviews, GRFP 12,500+ applications. Median
            funder load is 24 applications per program staff FTE (Center for
            Effective Philanthropy, 2023). Beleg is for the work that never
            lands in those piles.
          </p>
        </div>
      </div>
    </div>
  );
}
