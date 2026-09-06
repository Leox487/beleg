export function ProofField() {
  return (
    <svg
      className="bh-field"
      viewBox="0 0 640 420"
      aria-hidden="true"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M80 70 L210 118 L340 86 L470 150 L560 110" />
        <path d="M120 260 L240 210 L360 250 L500 200 L580 280" />
        <path d="M210 118 L240 210 L360 250 L470 150" />
        <path d="M340 86 L360 250" />
      </g>
      <g fill="currentColor">
        <circle className="is-pulse" cx="210" cy="118" r="3.2" />
        <circle cx="340" cy="86" r="2.4" />
        <circle className="is-pulse" cx="470" cy="150" r="3.2" />
        <circle cx="240" cy="210" r="2.4" />
        <circle className="is-pulse" cx="360" cy="250" r="3.2" />
        <circle cx="500" cy="200" r="2.2" />
        <circle cx="80" cy="70" r="1.8" />
        <circle cx="560" cy="110" r="1.8" />
        <circle cx="120" cy="260" r="1.8" />
        <circle cx="580" cy="280" r="1.8" />
      </g>
    </svg>
  );
}
