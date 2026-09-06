import Link from "next/link";

export function BelegFooter() {
  return (
    <footer className="bh-footer">
      <p className="bh-footer-word">Beleg</p>
      <p className="bh-footer-tag">A permanent record for things that matter.</p>
      <nav className="bh-footer-nav" aria-label="Footer">
        <Link href="/#record">Product</Link>
        <Link href="/verify">Verify</Link>
        <Link href="/#about">About</Link>
        <Link href="/contact">Contact</Link>
      </nav>
      <p className="bh-footer-est">Est. 2026</p>
    </footer>
  );
}
