"use client";

import { useState, type ReactNode } from "react";

export type LegalIcon =
  | "lock"
  | "db"
  | "user"
  | "hash"
  | "log"
  | "ban"
  | "server"
  | "globe"
  | "archive"
  | "scale"
  | "share"
  | "cookie"
  | "child"
  | "mail"
  | "age"
  | "tool"
  | "truth"
  | "duty"
  | "stamp"
  | "chain"
  | "cloud"
  | "shield"
  | "bug"
  | "alert"
  | "file"
  | "key"
  | "clock";

export type LegalCard = {
  id: string;
  icon: LegalIcon;
  title: string;
  body: string;
  more?: string;
  href?: { label: string; url: string };
};

export type LegalSection = {
  heading: string;
  cards: LegalCard[];
};

const ICONS: Record<LegalIcon, ReactNode> = {
  lock: (
    <path d="M8 11V8a4 4 0 1 1 8 0v3M6 11h12v9H6v-9Z" />
  ),
  db: (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 19c.8-3.2 3.2-5 7-5s6.2 1.8 7 5" />
    </>
  ),
  hash: (
    <>
      <path d="M4 12h16M4 7h16M4 17h16" />
      <path d="M9 4 7 20M17 4l-2 16" />
    </>
  ),
  log: <path d="M5 5h10l4 4v10H5V5Zm10 0v4h4" />,
  ban: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M6.2 6.2 17.8 17.8" />
    </>
  ),
  server: (
    <>
      <rect x="4" y="4" width="16" height="6" rx="1.2" />
      <rect x="4" y="14" width="16" height="6" rx="1.2" />
      <path d="M8 7h.01M8 17h.01" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16M12 4c2.5 2.8 3.8 5.8 3.8 8S14.5 17.2 12 20c-2.5-2.8-3.8-5.8-3.8-8S9.5 6.8 12 4Z" />
    </>
  ),
  archive: (
    <>
      <path d="M4 7h16v12H4V7Z" />
      <path d="M3 4h18v3H3V4Zm6 8h6" />
    </>
  ),
  scale: (
    <>
      <path d="M12 4v16M8 20h8" />
      <path d="M12 7 6 12h12L12 7Z" />
    </>
  ),
  share: (
    <>
      <circle cx="18" cy="5" r="2.4" />
      <circle cx="6" cy="12" r="2.4" />
      <circle cx="18" cy="19" r="2.4" />
      <path d="M8.2 13.1 15.8 17M15.8 7 8.2 10.9" />
    </>
  ),
  cookie: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M9 10h.01M14 9h.01M11 14h.01M15 15h.01" />
    </>
  ),
  child: (
    <>
      <circle cx="12" cy="8" r="3" />
      <path d="M6 20c.6-3.4 3-5.2 6-5.2s5.4 1.8 6 5.2" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="1.4" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  age: <path d="M8 20V9l4-4 4 4v11M8 12h8" />,
  tool: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 12h8M12 8v8" />
    </>
  ),
  truth: (
    <>
      <path d="M12 4 4 8v5c0 4.5 3.4 7.2 8 8 4.6-.8 8-3.5 8-8V8l-8-4Z" />
      <path d="m8.5 12 2.4 2.4 4.6-5" />
    </>
  ),
  duty: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5l3 2" />
    </>
  ),
  stamp: (
    <>
      <path d="M7 14h10v5H7v-5Z" />
      <path d="M9 14V9a3 3 0 1 1 6 0v5" />
    </>
  ),
  chain: (
    <>
      <path d="M9 13a4 4 0 0 1 0-5.7l2.1-2.1a4 4 0 0 1 5.7 5.7L15 12.7" />
      <path d="M15 11a4 4 0 0 1 0 5.7l-2.1 2.1a4 4 0 1 1-5.7-5.7L9 11.3" />
    </>
  ),
  cloud: (
    <path d="M7 18h10a4 4 0 0 0 .4-8A6 6 0 0 0 6.2 12 3.5 3.5 0 0 0 7 18Z" />
  ),
  shield: (
    <path d="M12 3 5 6v6c0 4.2 3.1 7 7 8 3.9-1 7-3.8 7-8V6l-7-3Z" />
  ),
  bug: (
    <>
      <path d="M8 9h8v7a4 4 0 0 1-8 0V9Z" />
      <path d="M12 9V5M8 12H4m16 0h-4M7 7 4 5m16 0-3 2M7 18l-3 2m16 0-3-2" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4 3 19h18L12 4Z" />
      <path d="M12 10v4M12 16h.01" />
    </>
  ),
  file: (
    <>
      <path d="M7 4h7l5 5v11H7V4Z" />
      <path d="M14 4v5h5" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="15" r="3.2" />
      <path d="M10.4 13.4 20 4v4h-3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7v5l3.2 2" />
    </>
  ),
};

function Icon({ name }: { name: LegalIcon }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {ICONS[name]}
      </g>
    </svg>
  );
}

function Row({
  section,
  selectedId,
  onSelect,
}: {
  section: LegalSection;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [start, setStart] = useState(0);
  const visible = 4;
  const canSlide = section.cards.length > visible;
  const slice = canSlide
    ? section.cards.slice(start, start + visible)
    : section.cards;
  const selected = section.cards.find((card) => card.id === selectedId);

  return (
    <section className="lp-section legal-section lp-face-jakarta">
      <div className="lp-shell">
      <div className="legal-band-head">
        <p className="legal-band-title">{section.heading}</p>
        {canSlide ? (
          <div className="legal-band-nav">
            <button
              type="button"
              className="legal-arrow"
              aria-label={`Previous ${section.heading} cards`}
              disabled={start === 0}
              onClick={() => setStart((n) => Math.max(0, n - 1))}
            >
              ‹
            </button>
            <button
              type="button"
              className="legal-arrow"
              aria-label={`Next ${section.heading} cards`}
              disabled={start >= section.cards.length - visible}
              onClick={() =>
                setStart((n) =>
                  Math.min(section.cards.length - visible, n + 1),
                )
              }
            >
              ›
            </button>
          </div>
        ) : null}
      </div>

      <ul className="legal-grid">
        {slice.map((card) => {
          const open = card.id === selectedId;
          return (
            <li key={card.id}>
              <button
                type="button"
                className={`legal-card${open ? " is-open" : ""}`}
                aria-expanded={open}
                onClick={() => onSelect(card.id)}
              >
                <span className="legal-icon">
                  <Icon name={card.icon} />
                </span>
                <strong>{card.title}</strong>
                <span>{card.body}</span>
                {card.more || card.href ? (
                  <em>{open ? "Showing detail" : "Learn more →"}</em>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      {selected?.more || selected?.href ? (
        <div className="legal-detail">
          {selected.more ? <p>{selected.more}</p> : null}
          {selected.href ? (
            <p>
              <a href={selected.href.url}>{selected.href.label}</a>
            </p>
          ) : null}
        </div>
      ) : null}
      </div>
    </section>
  );
}

export function LegalDeck({
  kicker,
  title,
  lead,
  updated,
  sections,
}: {
  kicker: string;
  title: string;
  lead: string;
  updated: string;
  sections: LegalSection[];
}) {
  const [open, setOpen] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      sections.map((section) => [section.heading, section.cards[0]?.id ?? ""]),
    ),
  );

  return (
    <>
      <section className="lp-hero ip-hero lp-face-inter">
        <div className="lp-hero-wash" aria-hidden="true" />
        <div className="lp-shell">
          <p className="lp-kicker">{kicker}</p>
          <h1 className="lp-h1 ip-h1">{title}</h1>
          <p className="lp-lead">{lead}</p>
          <p className="legal-updated">{updated}</p>
        </div>
      </section>

      {sections.map((section) => (
        <Row
          key={section.heading}
          section={section}
          selectedId={open[section.heading]}
          onSelect={(id) =>
            setOpen((prev) => ({ ...prev, [section.heading]: id }))
          }
        />
      ))}
    </>
  );
}
