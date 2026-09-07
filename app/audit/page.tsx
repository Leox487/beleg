import type { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/app/components/Footer";
import { CITY_SEEDS, citySlug } from "@/lib/civic-cities";
import { asTimestamp } from "@/lib/row";
import sql from "@/lib/supabase";

import { formatWhen, mapChange, shortHash, type CivicChangeRow } from "./civic-map";
import "./civic.css";

export const metadata: Metadata = {
  title: "US Municipal Record Audit · Beleg",
  description:
    "SHA-256 snapshots of public municipal datasets from CKAN open-data portals, with detected file changes and OpenTimestamps proofs.",
};

export const dynamic = "force-dynamic";

export default async function NationalAuditPage() {
  const [changeRows, statsRows, cityStatRows, cityChangeRows] =
    await Promise.all([
      sql`
        SELECT
          id, city, state, dataset_name, resource_url, old_hash, new_hash,
          detected_at, change_type
        FROM civic_changes
        ORDER BY detected_at DESC
        LIMIT 100
      `,
      sql`
        SELECT
          (SELECT count(DISTINCT resource_url)::int FROM civic_records) AS monitored,
          (SELECT count(DISTINCT city)::int FROM civic_records) AS cities,
          (SELECT max(retrieved_at) FROM civic_records) AS last_checked,
          (SELECT count(*)::int FROM civic_changes) AS changes
      `,
      sql`
        SELECT
          city,
          state,
          count(DISTINCT resource_url)::int AS monitored,
          max(retrieved_at) AS last_checked
        FROM civic_records
        GROUP BY city, state
      `,
      sql`
        SELECT city, count(*)::int AS changes
        FROM civic_changes
        GROUP BY city
      `,
    ]);

  const changes = [...changeRows].map((row) =>
    mapChange(row as Record<string, unknown>),
  );
  const statsRow = statsRows[0] as Record<string, unknown> | undefined;
  const monitored = Number(statsRow?.monitored ?? 0);
  const lastChecked = statsRow?.last_checked
    ? formatWhen(asTimestamp(statsRow.last_checked))
    : "Not yet";
  const changeCount = Number(statsRow?.changes ?? 0);

  const statsByCity = new Map<
    string,
    { monitored: number; last_checked: string | null }
  >();
  for (const raw of cityStatRows) {
    const row = raw as Record<string, unknown>;
    statsByCity.set(String(row.city), {
      monitored: Number(row.monitored ?? 0),
      last_checked: row.last_checked ? asTimestamp(row.last_checked) : null,
    });
  }
  const changesByCity = new Map<string, number>();
  for (const raw of cityChangeRows) {
    const row = raw as Record<string, unknown>;
    changesByCity.set(String(row.city), Number(row.changes ?? 0));
  }

  return (
    <main className="page civic-page">
      <div className="civic-inner">
        <header className="doc-header">
          <p className="doc-eyebrow">Cryptographic public record monitor</p>
          <h1 className="h1 doc-title">US Municipal Record Audit</h1>
          <p className="lp-lead">
            Beleg retrieves public files from municipal CKAN portals, hashes the
            bytes, and keeps every snapshot. A later hash that does not match is
            a content change, not a verdict.
          </p>
        </header>

        <ul className="civic-stats civic-stats-4">
          <li>
            <strong>{monitored}</strong>
            <span>Records monitored</span>
          </li>
          <li>
            <strong>{CITY_SEEDS.length}</strong>
            <span>Cities monitored</span>
          </li>
          <li>
            <strong>{lastChecked}</strong>
            <span>Last checked</span>
          </li>
          <li>
            <strong>{changeCount}</strong>
            <span>Changes detected</span>
          </li>
        </ul>

        <section className="civic-section">
          <h2>Cities</h2>
          <ul className="civic-grid">
            {CITY_SEEDS.map((seed) => {
              const stats = statsByCity.get(seed.city);
              const cityChanges = changesByCity.get(seed.city) ?? 0;
              return (
                <li key={seed.city}>
                  <Link href={`/audit/${citySlug(seed.city)}`}>
                    <p className="civic-grid-name">
                      {seed.city}, {seed.state}
                    </p>
                    <p className="civic-grid-meta">
                      {stats?.monitored ?? 0} records ·{" "}
                      {stats?.last_checked
                        ? formatWhen(stats.last_checked)
                        : "Not yet"}{" "}
                      · {cityChanges} changes
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="civic-section">
          <h2>Changes</h2>
          <p className="civic-disclaimer">
            A change means the file content changed since last retrieval. This
            may reflect a legitimate update, correction, or deletion — not
            necessarily misconduct.
          </p>
          <ChangeFeed changes={changes} showCity />
        </section>
      </div>
      <Footer />
    </main>
  );
}

function ChangeFeed({
  changes,
  showCity,
}: {
  changes: CivicChangeRow[];
  showCity?: boolean;
}) {
  if (changes.length === 0) {
    return <p className="civic-empty">No content changes recorded yet.</p>;
  }
  return (
    <ul className="civic-changes">
      {changes.map((row) => (
        <li key={row.id}>
          <p className="civic-change-name">
            {showCity && row.city
              ? `${row.city}${row.state ? `, ${row.state}` : ""} · `
              : null}
            {row.dataset_name}
          </p>
          <a href={row.resource_url}>{row.resource_url}</a>
          <p className="civic-change-meta">
            {formatWhen(row.detected_at)} · {row.change_type}
          </p>
          <p className="mono civic-hashes">
            <span>{shortHash(row.old_hash)}</span>
            <span>→</span>
            <span>{shortHash(row.new_hash)}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}
