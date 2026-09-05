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

function clip(text: string, max: number) {
  if (text.length <= max) return text;
  return `${text.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

function UseScene({ selected }: { selected: UseCase }) {
  return (
    <div className="ip-scene" aria-hidden="true">
      <span className="ip-scene-scan" />
      <span className="ip-scene-rail" />
      <div className="ip-scene-row">
        <i />
        <div>
          <b>#01</b>
          <span>{selected.entry.title}</span>
        </div>
        <em>SEAL</em>
      </div>
      <div className="ip-scene-row">
        <i />
        <div>
          <b>#02</b>
          <span>{clip(selected.witness, 52)}</span>
        </div>
        <em>OK</em>
      </div>
      <div className="ip-scene-row">
        <i />
        <div>
          <b>link</b>
          <span>beleg.app/p/…</span>
        </div>
        <em>LIVE</em>
      </div>
    </div>
  );
}

export function UseExplorer() {
  const [selectedId, setSelectedId] = useState(
    FEATURED[0]?.id ?? USE_CASES[0].id,
  );
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const wrapRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const selected = USE_CASES.find((u) => u.id === selectedId) ?? USE_CASES[0];

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

  useEffect(() => {
    const id = window.location.hash.replace(/^#/, "");
    if (id && USE_CASES.some((u) => u.id === id)) setSelectedId(id);
  }, []);

  useEffect(() => {
    function onHash() {
      const id = window.location.hash.replace(/^#/, "");
      if (!id || !USE_CASES.some((u) => u.id === id)) return;
      setSelectedId(id);
      requestAnimationFrame(() => {
        detailRef.current?.scrollIntoView({ block: "start" });
      });
    }
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

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
    if (window.location.hash.replace(/^#/, "") !== id) {
      history.replaceState(null, "", `#${id}`);
    }
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
                aria-pressed={item.id === selectedId}
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
              All {USE_CASES.length} professions
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
                placeholder="Search…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />

              <div className="uses-menu-scroll">
                {groups.length === 0 ? (
                  <p className="uses-empty small">
                    No match. If someone asks you to prove a thing happened,
                    Beleg still applies.
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
        role="region"
        aria-labelledby="uses-detail-title"
      >
        <div className="uses-detail-top">
          <div className="uses-detail-media">
            <UseScene selected={selected} />
          </div>

          <div className="uses-detail-copy">
            <p className="uses-detail-cat mono">{selected.category}</p>
            <h3 className="uses-detail-title" id="uses-detail-title">
              {selected.label}
            </h3>
            <p className="uses-detail-how">{selected.how}</p>
          </div>
        </div>

        <div className="uses-detail-grid">
          <div className="uses-block">
            <p className="uses-block-label mono">An entry you would record</p>
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
