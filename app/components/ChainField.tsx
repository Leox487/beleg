"use client";

/**
 * Beleg-native hero atmosphere: a living hash-chain field.
 * Soft linked seals + drifting arcs. Not a Neon clone.
 */
export function ChainField() {
  return (
    <div className="chain-field" aria-hidden="true">
      <div className="chain-field-wash" />
      <div className="chain-field-bloom chain-field-bloom-mint" />
      <div className="chain-field-bloom chain-field-bloom-gold" />
      <div className="chain-field-bloom chain-field-bloom-blue" />

      <svg
        className="chain-field-svg"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="cf-link" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(45, 212, 160, 0)" />
            <stop offset="35%" stopColor="rgba(45, 212, 160, 0.45)" />
            <stop offset="65%" stopColor="rgba(122, 162, 255, 0.35)" />
            <stop offset="100%" stopColor="rgba(224, 168, 62, 0)" />
          </linearGradient>
          <linearGradient id="cf-link-2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(224, 168, 62, 0)" />
            <stop offset="40%" stopColor="rgba(224, 168, 62, 0.4)" />
            <stop offset="100%" stopColor="rgba(45, 212, 160, 0)" />
          </linearGradient>
          <filter id="cf-soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
        </defs>

        <g className="chain-field-links">
          <path
            className="chain-field-path chain-field-path-a"
            d="M120 520 C280 420, 360 360, 520 340 S780 280, 980 220"
            fill="none"
            stroke="url(#cf-link)"
            strokeWidth="1.5"
            filter="url(#cf-soft)"
          />
          <path
            className="chain-field-path chain-field-path-b"
            d="M80 280 C240 320, 400 480, 560 500 S860 540, 1100 460"
            fill="none"
            stroke="url(#cf-link-2)"
            strokeWidth="1.25"
            filter="url(#cf-soft)"
          />
          <path
            className="chain-field-path chain-field-path-c"
            d="M200 160 C340 220, 480 200, 640 260 S900 380, 1080 340"
            fill="none"
            stroke="rgba(122, 162, 255, 0.28)"
            strokeWidth="1"
          />
        </g>

        <g className="chain-field-nodes">
          <g className="chain-field-node chain-field-node-mint" transform="translate(520 340)">
            <circle className="chain-field-ring" r="18" />
            <circle className="chain-field-core" r="4.5" />
          </g>
          <g className="chain-field-node chain-field-node-gold" transform="translate(780 300)">
            <circle className="chain-field-ring" r="14" />
            <circle className="chain-field-core" r="3.5" />
          </g>
          <g className="chain-field-node chain-field-node-blue" transform="translate(980 220)">
            <circle className="chain-field-ring" r="16" />
            <circle className="chain-field-core" r="4" />
          </g>
          <g className="chain-field-node chain-field-node-mint chain-field-node-delay" transform="translate(280 440)">
            <circle className="chain-field-ring" r="12" />
            <circle className="chain-field-core" r="3" />
          </g>
          <g className="chain-field-node chain-field-node-blue chain-field-node-delay" transform="translate(640 260)">
            <circle className="chain-field-ring" r="11" />
            <circle className="chain-field-core" r="2.8" />
          </g>
          <g className="chain-field-node chain-field-node-gold chain-field-node-delay" transform="translate(200 160)">
            <circle className="chain-field-ring" r="10" />
            <circle className="chain-field-core" r="2.5" />
          </g>
        </g>
      </svg>

      <div className="chain-field-grid" />
      <div className="chain-field-particles">
        <i /><i /><i /><i /><i /><i /><i /><i /><i /><i />
      </div>
      <div className="chain-field-glyphs">
        <span>a3f81c</span>
        <span>7b02e9</span>
        <span>c14d6a</span>
        <span>seal</span>
        <span>0x4e2</span>
        <span>linked</span>
      </div>
    </div>
  );
}
