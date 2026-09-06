import Link from "next/link";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/#live", label: "How it starts" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/verify", label: "Verify a proof" },
      { href: "/#public", label: "Public proofs" },
      { href: "/for-reviewers", label: "For reviewers" },
      { href: "/uses", label: "For founders" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/verify-guide", label: "Documentation" },
      { href: "/security", label: "Security" },
      { href: "/changelog", label: "Changelog" },
      { href: "/faq", label: "FAQ" },
      { href: "/glossary", label: "Glossary" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/tools", label: "Tools" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/security", label: "Security" },
      { href: "/privacy#cookies", label: "Cookies" },
    ],
  },
];

export function BelegFooter() {
  return (
    <footer className="bh-footer">
      <div className="bh-footer-top">
        <div>
          <p className="bh-footer-word">Beleg</p>
          <p className="bh-footer-tag">Built for verifiable progress.</p>
        </div>
        <div className="bh-footer-cols">
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p>{col.title}</p>
              {col.links.map((link) => (
                <Link key={link.href + link.label} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>
      </div>
      <p className="bh-footer-est">© 2026 Beleg</p>
    </footer>
  );
}
