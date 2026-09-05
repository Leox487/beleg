/**
 * The seal: a small stamped mark used wherever something is authenticated.
 * Green for a verified chain, gold for a Bitcoin anchor, wax for a break.
 */
export function Seal({
  tone = "seal",
  size = "md",
  ring = false,
  glyph = "\u2713",
  label,
}: {
  tone?: "seal" | "gold" | "wax";
  size?: "md" | "lg";
  ring?: boolean;
  glyph?: string;
  label?: string;
}) {
  const classes = [
    "seal",
    tone === "gold" ? "seal-gold" : tone === "wax" ? "seal-wax" : "",
    size === "lg" ? "seal-lg" : "",
    ring ? "seal-ring" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      className={classes}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {glyph}
    </span>
  );
}
