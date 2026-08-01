"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  CATEGORIES,
  FEATURED_IDS,
  USE_CASES,
  type UseCase,
} from "@/lib/use-cases";

const FEATURED = FEATURED_IDS.map(
  (id) => USE_CASES.find((u) => u.id === id) as UseCase,
).filter(Boolean);

export function UseExplorer() {
  const [selectedId, setSelectedId] = useState(FEATURED[0]?.id ?? USE_CASES[0].id);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const wrapRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const selected =
    USE_CASES.find((u) => u.id === selectedId) ?? USE_CASES[0];

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q
      ? USE_CASES.filter(
          (u) =>
            u.label.toLowerCase().includes(q) ||
            u.category.toLowerCase().includes(q) ||
            u.how.toLowerCase().includes(q),
        )
      : USE_CASES;

    return CATEGORIES.map((category) => ({
      category,
      items: matches.filter((u) => u.category === category),
    })).filter((g) => g.items.length > 0);
  }, [query]);

  // Close the dropdown on outside click or Escape.
  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  function choose(id: string) {
    setSelectedId(id);
    setOpen(false);
    setQuery("");
    // Nudge focus to the detail so keyboard and screen-reader users land on
    // the content that just changed.
    requestAnimationFrame(() => detailRef.current?.focus());
  }

  return (
    <div className="uses">
      <div className="uses-picker" ref={wrapRef}>
        <ul className="uses-chips">
          {FEATURED.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`uses-chip${
                  item.id === selectedId ? " is-active" : ""
                }`}
                onClick={() => choose(item.id)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="uses-dropdown">
          <button
            type="button"
            className={`uses-trigger${open ? " is-open" : ""}`}
            aria-expanded={open}
            aria-haspopup="listbox"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="uses-trigger-label">
              Browse all {USE_CASES.length} professions
            </span>
            <span className="uses-caret" aria-hidden="true">
              ▾
            </span>
          </button>

          {open ? (
            <div className="uses-menu" role="listbox">
              <input
                ref={searchRef}
                type="text"
                className="uses-search"
                placeholder="Search professions…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />

              <div className="uses-menu-scroll">
                {groups.length === 0 ? (
                  <p className="uses-empty small">
                    No match — but Beleg works for anyone who gets asked to prove
                    something happened.
                  </p>
                ) : (
                  groups.map((group) => (
                    <div key={group.category} className="uses-group">
                      <p className="uses-group-label mono">{group.category}</p>
                      <ul className="uses-list">
                        {group.items.map((item) => (
                          <li key={item.id}>
                            <button
                              type="button"
                              role="option"
                              aria-selected={item.id === selectedId}
                              className={`uses-option${
                                item.id === selectedId ? " is-active" : ""
                              }`}
                              onClick={() => choose(item.id)}
                            >
                              {item.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div
        className="uses-detail"
        ref={detailRef}
        tabIndex={-1}
        key={selected.id}
      >
        <p className="uses-detail-cat mono">{selected.category}</p>
        <h3 className="uses-detail-title">{selected.label}</h3>
        <p className="uses-detail-how">{selected.how}</p>

        <div className="uses-detail-grid">
          <div className="uses-block">
            <p className="uses-block-label mono">An entry you&apos;d record</p>
            <div className="uses-entry">
              <span className="uses-entry-seq mono">#1</span>
              <div>
                <p className="uses-entry-title">{selected.entry.title}</p>
                <p className="uses-entry-detail">{selected.entry.detail}</p>
              </div>
            </div>
          </div>

          <div className="uses-block">
            <p className="uses-block-label mono">Who witnesses it</p>
            <p className="uses-block-text">{selected.witness}</p>
          </div>

          <div className="uses-block">
            <p className="uses-block-label mono">Where the proof link goes</p>
            <p className="uses-block-text">{selected.useIt}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
