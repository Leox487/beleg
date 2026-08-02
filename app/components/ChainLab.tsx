"use client";

import { useEffect, useState } from "react";

import { GENESIS_HASH, sha256HexBrowser } from "@/lib/hash-browser";

const ENTRIES = [
  { kind: "grant", title: "Grant received \u2014 $12,000" },
  { kind: "attestation", title: "Confirmed by Maya Chen" },
  { kind: "milestone", title: "Pilot launched with 3 clinics" },
];

const ORIGINAL_TITLES = ENTRIES.map((e) => e.title);
const TAMPERED_TITLE = "Grant received \u2014 $120,000";

// Same shape as the real ledger: hash the entry's contents, then hash that
// together with the previous link. Simplified field list so the demo stays
// readable, but the SHA-256 calls are the genuine Web Crypto ones.
async function computeChain(titles: string[]): Promise<string[]> {
  let prev = GENESIS_HASH;
  const out: string[] = [];
  for (let i = 0; i < titles.length; i++) {
    const content = await sha256HexBrowser(
      JSON.stringify([i + 1, ENTRIES[i].kind, titles[i]]),
    );
    prev = await sha256HexBrowser(prev + content);
    out.push(prev);
  }
  return out;
}

function shorten(hash: string): string {
  return `${hash.slice(0, 10)}\u2026${hash.slice(-8)}`;
}

/**
 * A real hash chain the reader can break. Editing entry #1 recomputes every
 * link with actual SHA-256, so the cascade of red is the genuine behaviour of
 * the ledger rather than a scripted animation.
 */
export default function ChainLab() {
  const [titles, setTitles] = useState(ORIGINAL_TITLES);
  const [sealed, setSealed] = useState<string[]>([]);
  const [live, setLive] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    computeChain(ORIGINAL_TITLES).then((h) => {
      if (!cancelled) setSealed(h);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    computeChain(titles).then((h) => {
      if (!cancelled) setLive(h);
    });
    return () => {
      cancelled = true;
    };
  }, [titles]);

  const ready = sealed.length === ENTRIES.length && live.length === ENTRIES.length;
  const brokenFrom = ready ? live.findIndex((h, i) => h !== sealed[i]) : -1;
  const isBroken = brokenFrom !== -1;

  function setFirstTitle(value: string) {
    setTitles([value, ...ORIGINAL_TITLES.slice(1)]);
  }

  return (
    <div className={`lab${isBroken ? " is-broken" : ""}`}>
      <div className="lab-controls">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setFirstTitle(TAMPERED_TITLE)}
          disabled={!ready || titles[0] === TAMPERED_TITLE}
        >
          Tamper with entry #1
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setTitles(ORIGINAL_TITLES)}
          disabled={!isBroken}
        >
          Reset
        </button>
        <span className="lab-hint small">
          &hellip; or just type in the field below.
        </span>
      </div>

      <ol className="lab-chain">
        {ENTRIES.map((entry, i) => {
          const broken = isBroken && i >= brokenFrom;
          return (
            <li
              key={entry.kind}
              className={`lab-entry${broken ? " is-broken" : ""}`}
              style={{ transitionDelay: `${(i - Math.max(brokenFrom, 0)) * 140}ms` }}
            >
              <div className="lab-entry-head">
                <span className="lab-entry-seq mono">#{i + 1}</span>
                <span className="lab-entry-kind">{entry.kind}</span>
              </div>

              {i === 0 ? (
                <label className="lab-edit">
                  <span className="lab-edit-label">Editable &mdash; try changing it</span>
                  <input
                    className="lab-input"
                    value={titles[0]}
                    onChange={(e) => setFirstTitle(e.target.value)}
                    aria-label="Entry 1 title"
                  />
                </label>
              ) : (
                <p className="lab-entry-title">{entry.title}</p>
              )}

              <div className="lab-entry-hash">
                <span className="lab-hash-label">seal</span>
                <span className="mono lab-hash-value">
                  {ready ? shorten(live[i]) : "computing\u2026"}
                </span>
              </div>

              {broken ? (
                <p className="lab-entry-note">
                  Seal no longer matches what was recorded.
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className={`lab-verdict${isBroken ? " is-broken" : ""}`}>
        {isBroken ? (
          <>
            <strong>Chain broken at entry #{brokenFrom + 1}</strong>
            {" \u2014 and every entry after it. This is exactly what a reader would see."}
          </>
        ) : (
          <>
            <strong>Chain verified</strong>
            {" \u00b7 3 entries intact. Every seal matches the entry it was made from."}
          </>
        )}
      </div>
    </div>
  );
}
