import Link from "next/link";

export function BetaNotice() {
  return (
    <p className="beta-notice" role="note">
      Public beta. Beleg records what you type. It does not guarantee funding,
      legal accuracy, or that an event is true. Optional inbound email may
      draft a title with a model — check that draft.{" "}
      <Link href="/terms">Terms</Link>
      {" · "}
      <Link href="/privacy">Privacy</Link>
    </p>
  );
}
