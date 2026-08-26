"use client";

/**
 * Beleg-native hero atmosphere: a living hash tree, not a forest.
 * Linked seals branch the way a Merkle tree does. Soft color, not a Neon clone.
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
            <stop offset="35%" stopColor="rgba(45, 212, 160, 0.55)" />
            <stop offset="65%" stopColor="rgba(122, 162, 255, 0.42)" />
            <stop offset="100%" stopColor="rgba(224, 168, 62, 0)" />
          </linearGradient>
          <linearGradient id="cf-link-2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(224, 168, 62, 0)" />
            <stop offset="40%" stopColor="rgba(224, 168, 62, 0.48)" />
            <stop offset="100%" stopColor="rgba(45, 212, 160, 0)" />
          </linearGradient>
          <linearGradient id="cf-tree" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="rgba(45, 212, 160, 0.7)" />
            <stop offset="55%" stopColor="rgba(122, 162, 255, 0.4)" />
            <stop offset="100%" stopColor="rgba(224, 168, 62, 0.15)" />
          </linearGradient>
          <filter id="cf-soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
        </defs>

        <g className="chain-field-tree">
          <path
            className="chain-field-path chain-field-path-tree"
            d="M980 70 L980 150 L860 250 M980 150 L1100 250 M860 250 L790 360 M860 250 L930 360 M1100 250 L1030 360 M1100 250 L1170 360"
            fill="none"
            stroke="url(#cf-tree)"
            strokeWidth="1.35"
            filter="url(#cf-soft)"
          />
          <g className="chain-field-node chain-field-node-mint" transform="translate(980 70)">
            <circle className="chain-field-ring" r="16" />
            <circle className="chain-field-core" r="4" />
          </g>
          <g className="chain-field-node chain-field-node-mint chain-field-node-delay" transform="translate(860 250)">
            <circle className="chain-field-ring" r="11" />
            <circle className="chain-field-core" r="3" />
          </g>
          <g className="chain-field-node chain-field-node-blue" transform="translate(1100 250)">
            <circle className="chain-field-ring" r="11" />
            <circle className="chain-field-core" r="3" />
          </g>
          <g className="chain-field-node chain-field-node-gold chain-field-node-delay" transform="translate(790 360)">
            <circle className="chain-field-ring" r="8" />
            <circle className="chain-field-core" r="2.2" />
          </g>
          <g className="chain-field-node chain-field-node-mint" transform="translate(930 360)">
            <circle className="chain-field-ring" r="8" />
            <circle className="chain-field-core" r="2.2" />
          </g>
          <g className="chain-field-node chain-field-node-blue chain-field-node-delay" transform="translate(1030 360)">
            <circle className="chain-field-ring" r="8" />
            <circle className="chain-field-core" r="2.2" />
          </g>
          <g className="chain-field-node chain-field-node-gold" transform="translate(1170 360)">
            <circle className="chain-field-ring" r="8" />
            <circle className="chain-field-core" r="2.2" />
          </g>
        </g>

        <g className="chain-field-links">
          <path
            className="chain-field-path chain-field-path-a"
            d="M120 520 C280 420, 360 360, 520 340 S780 280, 980 220"
            fill="none"
            stroke="url(#cf-link)"
            strokeWidth="1.6"
            filter="url(#cf-soft)"
          />
          <path
            className="chain-field-path chain-field-path-b"
            d="M80 280 C240 320, 400 480, 560 500 S860 540, 1100 460"
            fill="none"
            stroke="url(#cf-link-2)"
            strokeWidth="1.35"
            filter="url(#cf-soft)"
          />
          <path
            className="chain-field-path chain-field-path-c"
            d="M200 160 C340 220, 480 200, 640 260 S900 380, 1080 340"
            fill="none"
            stroke="rgba(122, 162, 255, 0.38)"
            strokeWidth="1.1"
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
          <g className="chain-field-node chain-field-node-blue" transform="translate(640 260)">
            <circle className="chain-field-ring" r="11" />
            <circle className="chain-field-core" r="2.8" />
          </g>
          <g className="chain-field-node chain-field-node-mint chain-field-node-delay" transform="translate(280 440)">
            <circle className="chain-field-ring" r="12" />
            <circle className="chain-field-core" r="3" />
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
