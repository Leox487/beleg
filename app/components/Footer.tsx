import Link from "next/link";

const COLUMNS = [
  {
    heading: "Product",
    links: [
      { href: "/how-it-works", label: "How it works" },
      { href: "/uses", label: "Who it's for" },
      { href: "/verify", label: "Verify a ledger" },
      { href: "/changelog", label: "Changelog" },
    ],
  },
  {
    heading: "Learn",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/glossary", label: "Glossary" },
      { href: "/verify-guide", label: "Verify it yourself" },
      { href: "/security", label: "Security" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-grid">
          <div className="site-footer-brand">
            <p className="site-footer-wordmark">Beleg</p>
            <p className="site-footer-tagline">
              A sealed record of what you actually did.
            </p>
            <p className="site-footer-anchor">
              <span className="site-footer-anchor-glyph" aria-hidden="true">
                ⚓
              </span>
              Anchored to Bitcoin
            </p>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h2 className="site-footer-heading">{column.heading}</h2>
              <ul className="site-footer-list">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="site-footer-bottom">
          <p>© 2026 Beleg · Built by Leo Sun in Philadelphia</p>
          <p>Beta</p>
        </div>
      </div>
    </footer>
  );
}
