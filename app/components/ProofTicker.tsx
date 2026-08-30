"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Illustrative ledger entries, not real records. A fresh set is drawn on
 * every load and again on every loop, so the band never reads the same twice.
 */
const PROOFS = [
  "A founder proved first revenue the day it cleared",
  "A grant officer confirmed a $12,000 award",
  "A contractor proved an engagement existed, under NDA",
  "A clinic lead confirmed three sites went live",
  "A reviewer recomputed forty seals in her own browser",
  "A designer proved a signed pilot without naming the client",
  "A program officer confirmed the award landed in March",
  "An advisor confirmed she joined before the raise",
  "A researcher proved the data came first, then the paper",
  "A jury chair confirmed a prize, two years later",
  "An engineer sealed a launch, then chained eleven more",
  "A pending proof was dated on Bitcoin block 883,214",
  "A school district confirmed a term long pilot",
  "A studio proved the brief predated the pitch",
  "A reviewer found the chain intact, without asking us",
  "A checker caught one edited entry, and every seal after it",
  "A cofounder confirmed the split on the day they agreed",
  "A nonprofit proved a $50,000 match before the gala",
  "A client confirmed the dates and kept the spec private",
  "An accelerator confirmed the cohort, not just the logo",
  "A solo dev proved a paying customer in week two",
  "A mentor confirmed six months of work in one click",
  "A lab proved a sample was logged before the result",
  "A partner confirmed the contract without a Beleg account",
  "A photographer proved the shoot happened in April",
  "An operator sealed a $4,000 month before the deck existed",
  "A city confirmed the tool went into production",
  "A translator proved delivery, three timezones away",
  "A founder proved a pilot, and the client confirmed it",
  "A reviewer opened one link and checked the whole trail",
  "A treasurer confirmed the books closed on time",
  "A team proved a shipped feature on the day it shipped",
  "An editor confirmed the piece ran, and when",
  "A grant panel confirmed the score after the decision",
  "A maker proved the first hundred units, one by one",
  "An intern proved the project was hers",
];

const VISIBLE = 12;
/** Pixels per second. Keeps the crawl steady however long the lines run. */
const SPEED = 68;

function drawSet(previous: readonly string[]): string[] {
  const unseen = PROOFS.filter((line) => !previous.includes(line));
  const bag = unseen.length >= VISIBLE ? [...unseen] : [...PROOFS];
  for (let i = bag.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag.slice(0, VISIBLE);
}

export function ProofTicker() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<string[]>(() => PROOFS.slice(0, VISIBLE));
  const [duration, setDuration] = useState(0);

  // Drawn after mount so the server HTML and the first client render agree.
  useEffect(() => {
    setLines((current) => drawSet(current));
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const half = track.scrollWidth / 2;
    if (half > 0) setDuration(half / SPEED);
  }, [lines]);

  const reroll = useCallback(() => {
    setLines((current) => drawSet(current));
  }, []);

  return (
    <div className="proof-ticker">
      <p className="proof-ticker-label">On the record</p>
      <div className="proof-ticker-window">
        <div
          ref={trackRef}
          className="proof-ticker-track"
          style={duration ? { animationDuration: `${duration}s` } : undefined}
          onAnimationIteration={reroll}
          aria-hidden="true"
        >
          {[0, 1].map((copy) => (
            <ul className="proof-ticker-run" key={copy}>
              {lines.map((line) => (
                <li className="proof-ticker-item" key={`${copy}-${line}`}>
                  <span className="proof-ticker-dot" />
                  {line}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
}
