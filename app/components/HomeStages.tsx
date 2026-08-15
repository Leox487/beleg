"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

function useOnScreen(threshold = 0.4) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setOn(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setOn(true);
        obs.disconnect();
      },
      { threshold, rootMargin: "0px 0px -10% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, on };
}

function StageFrame({
  className,
  children,
  threshold,
}: {
  className: string;
  children: ReactNode;
  threshold?: number;
}) {
  const { ref, on } = useOnScreen(threshold);
  return (
    <div
      ref={ref}
      className={`${className}${on ? " is-on" : ""}`}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}

/** Animated hash-chain: entries lock in sequence. */
export function StageSeal() {
  return (
    <StageFrame className="hs hs-seal">
      <div className="hs-seal-track">
        {[
          { seq: "#01", title: "Grant received", hash: "a3f81c94b7d0e29b" },
          { seq: "#02", title: "Confirmed by Maya", hash: "7b02e9f3314fc118" },
          { seq: "#03", title: "Pilot launched", hash: "c14d6a2e8099e07f" },
        ].map((row) => (
          <div className="hs-seal-item" key={row.seq}>
            <span className="hs-seal-node" />
            <div className="hs-seal-card">
              <span className="hs-seal-seq">{row.seq}</span>
              <span className="hs-seal-title">{row.title}</span>
              <span className="hs-seal-hash">{row.hash}</span>
              <span className="hs-seal-flag">SEALED</span>
            </div>
          </div>
        ))}
      </div>
    </StageFrame>
  );
}

/** Attestation: a witness confirms, then the confirm seals. */
export function StageWitness() {
  return (
    <StageFrame className="hs hs-witness">
      <div className="hs-wit-mail">
        <span className="hs-wit-from">to maya@civic.fund</span>
        <span className="hs-wit-sub">Confirm this grant?</span>
        <span className="hs-wit-btn">Confirm without an account</span>
      </div>
      <div className="hs-wit-arrow" />
      <div className="hs-wit-result">
        <span className="hs-wit-check">✓</span>
        <span>
          Confirmed by Maya Chen
          <em>sealed into the chain</em>
        </span>
      </div>
    </StageFrame>
  );
}

/** In-browser verify: button, scan, green intact banner. */
export function StageVerify() {
  return (
    <StageFrame className="hs hs-verify">
      <div className="hs-ver-chrome">
        <span className="hs-ver-dot" />
        <span className="hs-ver-dot" />
        <span className="hs-ver-dot" />
        <span className="hs-ver-url">belegapp.com/p/northstar</span>
      </div>
      <div className="hs-ver-body">
        <span className="hs-ver-btn">Verify chain</span>
        <span className="hs-ver-scan" />
        <span className="hs-ver-ok">
          <span className="hs-ver-ok-dot" />
          All 8 seals intact
        </span>
      </div>
    </StageFrame>
  );
}

export function StageGrant() {
  return (
    <StageFrame className="hs hs-mini hs-grant" threshold={0.3}>
      <span className="hs-grant-amt">$12,000</span>
      <span className="hs-grant-meta">Civic Innovation Fund</span>
      <span className="hs-grant-ok">Verified on the public page</span>
    </StageFrame>
  );
}

export function StageSolo() {
  return (
    <StageFrame className="hs hs-mini hs-solo" threshold={0.3}>
      <span className="hs-solo-node" />
      <span className="hs-solo-wire" />
      <span className="hs-solo-node" />
      <span className="hs-solo-wire" />
      <span className="hs-solo-node" />
      <span className="hs-solo-cap">the chain remembers</span>
    </StageFrame>
  );
}

export function StageNda() {
  return (
    <StageFrame className="hs hs-mini hs-nda" threshold={0.3}>
      <span className="hs-nda-lock">NDA</span>
      <span className="hs-nda-plus">+</span>
      <span className="hs-nda-confirm">Client confirmed</span>
    </StageFrame>
  );
}

export function StageStamp() {
  return (
    <StageFrame className="hs hs-stamp" threshold={0.35}>
      <span className="hs-stamp-ring" />
      <span className="hs-stamp-core">SEAL</span>
    </StageFrame>
  );
}
