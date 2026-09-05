/** Sharp B + orbit mark from the Beleg sketch. B uses currentColor. */
export function BelegMark({
  className,
  title,
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      {/* Orbit behind the upper bowl */}
      <g transform="translate(32 32) rotate(-32)">
        <path
          d="M -21 0 A 21 9 0 0 1 21 0"
          stroke="#2DD4A0"
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity="0.38"
        />
      </g>

      {/* Angular B: vertical spine, two right-pointing triangles */}
      <path
        fill="currentColor"
        d="M17 12h7.2L50 22.4 26.4 32 50 41.6 24.2 52H17V12Z"
      />

      {/* Orbit in front of the lower bowl + record nodes */}
      <g transform="translate(32 32) rotate(-32)">
        <path
          d="M 21 0 A 21 9 0 0 1 -21 0"
          stroke="#2DD4A0"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <circle cx="21" cy="0" r="3.15" fill="#E0A83E" />
        <circle cx="-21" cy="0" r="3.15" fill="#E0A83E" />
      </g>
    </svg>
  );
}
