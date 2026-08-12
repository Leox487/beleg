export function DkimChip({ verified }: { verified: boolean | null }) {
  if (verified == null) return null;
  if (verified) {
    return <span className="dkim-chip dkim-chip-ok">DKIM ✓</span>;
  }
  return <span className="dkim-chip dkim-chip-miss">DKIM —</span>;
}
