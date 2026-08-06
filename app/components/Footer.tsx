import Link from "next/link";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/uses", label: "Who it's for" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <nav className="site-footer-links small">
        {LINKS.map((link, i) => (
          <span key={link.href} className="site-footer-item">
            {i > 0 ? (
              <span className="site-footer-dot" aria-hidden="true">
                ·
              </span>
            ) : null}
            <Link href={link.href} className="footer-link">
              {link.label}
            </Link>
          </span>
        ))}
      </nav>
      <p className="site-footer-fine small">© 2026 Beleg</p>
    </footer>
  );
}
