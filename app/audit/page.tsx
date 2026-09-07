import type { Metadata } from "next";
import Link from "next/link";

import { CivicChangeList } from "@/app/components/CivicChangeList";
import { Footer } from "@/app/components/Footer";
import { MUNICIPAL_SEEDS, citySlug } from "@/lib/civic-cities";
import { asTimestamp } from "@/lib/row";
import { SITE_URL } from "@/lib/site";
import sql from "@/lib/supabase";

import { formatWhen, mapChange } from "./civic-map";
import "./civic.css";

export const metadata: Metadata = {
  title: "US Municipal Record Audit — Beleg",
  description:
    "Cryptographic monitoring of public government records across 5+ US cities. Every file hashed and anchored to Bitcoin daily.",
  alternates: {
    canonical: `${SITE_URL}/audit`,
  },
};

export const dynamic = "force-dynamic";

const HOW_STEPS = [
  {
    n: "01",
    title: "Retrieve",
    text: "Every day, Beleg fetches each monitored file from the city's official open data portal.",
  },
  {
    n: "02",
    title: "Hash",
    text: "The raw bytes of every file are run through SHA-256, producing a unique fingerprint.",
  },
  {
    n: "03",
    title: "Anchor",
    text: "That fingerprint is submitted to the Bitcoin blockchain via OpenTimestamps, so its existence at this exact time is publicly provable without trusting Beleg.",
  },
] as const;

export default async function NationalAuditPage() {
  const [changeRows, statsRows, cityStatRows, cityChangeRows] =
    await Promise.all([
      sql`
        SELECT
          id, city, state, dataset_name, resource_url, old_hash, new_hash,
          detected_at, change_type, content_diff
        FROM civic_changes
        ORDER BY detected_at DESC
        LIMIT 100
      `,
      sql`
        SELECT
          (SELECT count(DISTINCT resource_url)::int FROM civic_records) AS monitored,
          (SELECT count(DISTINCT city)::int FROM civic_records) AS cities,
          (SELECT max(retrieved_at) FROM civic_records) AS last_checked,
          (SELECT count(*)::int FROM civic_changes) AS changes,
          (SELECT count(*)::int FROM civic_records WHERE anchor_status = 'confirmed') AS anchors
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
  const anchorCount = Number(statsRow?.anchors ?? 0);

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

  const federalStats = statsByCity.get("Federal");
  const federalChanges = changesByCity.get("Federal") ?? 0;
  const cities = [...MUNICIPAL_SEEDS].sort((a, b) => {
    const aChanges = changesByCity.get(a.city) ?? 0;
    const bChanges = changesByCity.get(b.city) ?? 0;
    if (aChanges > 0 && bChanges === 0) return -1;
    if (bChanges > 0 && aChanges === 0) return 1;
    return a.city.localeCompare(b.city);
  });

  return (
    <main className="page civic-page">
      <div className="civic-inner">
        <header className="doc-header">
          <p className="doc-eyebrow">Live — updated daily</p>
          <h1 className="h1 doc-title">US Municipal Record Audit</h1>
          <p className="lp-lead">
            Beleg retrieves public files from municipal open data portals, hashes the
            bytes, and keeps every snapshot. A later hash that does not match is
            a content change, not a verdict.
          </p>
        </header>

        <ul className="civic-stats civic-stats-6">
          <li>
            <strong>{monitored}</strong>
            <span>Records monitored</span>
          </li>
          <li>
            <strong>{MUNICIPAL_SEEDS.length}</strong>
            <span>Cities monitored</span>
          </li>
          <li>
            <strong>Federal + {MUNICIPAL_SEEDS.length} cities</strong>
            <span>Levels of government monitored</span>
          </li>
          <li>
            <strong>{lastChecked}</strong>
            <span>Last checked</span>
          </li>
          <li>
            <strong>{changeCount}</strong>
            <span>Changes detected</span>
          </li>
          <li>
            <strong>{anchorCount}</strong>
            <span>Bitcoin anchors</span>
          </li>
        </ul>

        <section className="civic-section">
          <h2>Federal</h2>
          <ul className="civic-grid">
            <li>
              <Link href="/audit/federal">
                <p className="civic-grid-name">
                  <span
                    className={
                      federalChanges > 0
                        ? "civic-dot civic-dot-warn"
                        : "civic-dot civic-dot-ok"
                    }
                    aria-hidden="true"
                  />
                  US Federal Government
                </p>
                <p className="civic-grid-meta">
                  {federalStats?.monitored ?? 0} records
                </p>
                <p className="civic-grid-meta">
                  Last checked{" "}
                  {federalStats?.last_checked
                    ? formatWhen(federalStats.last_checked)
                    : "Not yet"}
                </p>
                <p className="civic-grid-meta">
                  {federalChanges} {federalChanges === 1 ? "change" : "changes"}
                </p>
              </Link>
            </li>
          </ul>
        </section>

        <section className="civic-section">
          <h2>Cities</h2>
          <ul className="civic-grid">
            {cities.map((seed) => {
              const stats = statsByCity.get(seed.city);
              const cityChanges = changesByCity.get(seed.city) ?? 0;
              return (
                <li key={seed.city}>
                  <Link href={`/audit/${citySlug(seed.city)}`}>
                    <p className="civic-grid-name">
                      <span
                        className={
                          cityChanges > 0
                            ? "civic-dot civic-dot-warn"
                            : "civic-dot civic-dot-ok"
                        }
                        aria-hidden="true"
                      />
                      {seed.city}, {seed.state}
                    </p>
                    <p className="civic-grid-meta">
                      {stats?.monitored ?? 0} records
                    </p>
                    <p className="civic-grid-meta">
                      Last checked{" "}
                      {stats?.last_checked
                        ? formatWhen(stats.last_checked)
                        : "Not yet"}
                    </p>
                    <p className="civic-grid-meta">
                      {cityChanges} {cityChanges === 1 ? "change" : "changes"}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="civic-section">
          <h2>How this works</h2>
          <ol className="civic-how">
            {HOW_STEPS.map((step) => (
              <li key={step.n}>
                <p className="civic-how-n">{step.n}</p>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="civic-section">
          <h2>Changes</h2>
          <p className="civic-disclaimer">
            A change means the file content changed since last retrieval. This
            may reflect a legitimate update, correction, or deletion — not
            necessarily misconduct.
          </p>
          <CivicChangeList changes={changes} showCity />
        </section>

        <p className="civic-footnote">
          This system monitors public records. A detected change means the
          file&apos;s bytes changed since last retrieval — not that anything
          improper occurred. All source data is from official government open
          data portals.
        </p>
      </div>
      <Footer />
    </main>
  );
}
