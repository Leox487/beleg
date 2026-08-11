import type { CSSProperties } from "react";

/**
 * Fully rendered HTML/CSS mock of a Beleg public proof page.
 * Sits in the hero as the product visual — not an illustration.
 * Entries seal in sequence so the mock feels like a living chain.
 */
export function HeroProofMock() {
  const seal = (delay: string): CSSProperties =>
    ({ "--seal-delay": delay }) as CSSProperties;

  return (
    <div className="hero-mock-wrap" aria-hidden="true">
      <div className="hero-mock-glow" />
      <div className="hero-mock">
        <div className="hero-mock-chrome">
          <div className="hero-mock-dots">
            <span />
            <span />
            <span />
          </div>
          <div className="hero-mock-url">
            <span className="hero-mock-lock">🔒</span>
            beleg.app/p/northstar
          </div>
        </div>

        <div className="hero-mock-body">
          <div className="hero-mock-verify">
            <span className="hero-mock-seal">✓</span>
            <span>Chain verified · 8 entries intact</span>
          </div>

          <ul className="hero-mock-entries">
            <li className="hero-mock-entry" style={seal("0.4s")}>
              <span className="hero-mock-seq">#06</span>
              <div>
                <p className="hero-mock-title">Grant received — $12,000</p>
                <p className="hero-mock-hash">
                  <span className="hero-mock-seal-label">SEAL</span>
                  a3f81c94b7d0e29b1c4a
                </p>
              </div>
            </li>
            <li className="hero-mock-entry is-attest" style={seal("1.1s")}>
              <span className="hero-mock-seq">#07</span>
              <div>
                <p className="hero-mock-title">
                  Confirmed by Maya Chen — Civic Innovation Fund
                </p>
                <p className="hero-mock-hash">
                  <span className="hero-mock-seal-label">SEAL</span>
                  7b02e9f3314fc118d6a2
                </p>
              </div>
            </li>
            <li className="hero-mock-entry" style={seal("1.8s")}>
              <span className="hero-mock-seq">#08</span>
              <div>
                <p className="hero-mock-title">Pilot launched with 3 clinics</p>
                <p className="hero-mock-hash">
                  <span className="hero-mock-seal-label">SEAL</span>
                  c14d6a2e8099e07f3b81
                </p>
              </div>
            </li>
          </ul>

          <div className="hero-mock-anchor">
            <span className="hero-mock-anchor-glyph">⚓</span>
            Anchored to Bitcoin block #883,214
          </div>
        </div>
      </div>
    </div>
  );
}
