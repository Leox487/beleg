import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CivicChangeList } from "@/app/components/CivicChangeList";
import { CivicProofZip } from "@/app/components/CivicProofZip";
import { CivicSubscribe } from "@/app/components/CivicSubscribe";
import { CivicVerify } from "@/app/components/CivicVerify";
import { Footer } from "@/app/components/Footer";
import {
  CITY_SEEDS,
  citySlug,
  civicDisplayName,
  findCityBySlug,
} from "@/lib/civic-cities";
import { asTimestamp } from "@/lib/row";
import { SITE_URL } from "@/lib/site";
import sql from "@/lib/supabase";

import { formatWhen, mapChange, mapRecord, shortHash } from "../civic-map";
import "../civic.css";

export const dynamic = "force-dynamic";

type CityParams = { city: string };

export function generateStaticParams() {
  return CITY_SEEDS.map((seed) => ({ city: citySlug(seed.city) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<CityParams>;
}): Promise<Metadata> {
  const { city: slug } = await params;
  const seed = findCityBySlug(slug);
  if (!seed) {
    return { title: "Civic Audit · Beleg" };
  }

  const countRows = await sql`
    SELECT count(DISTINCT resource_url)::int AS monitored
    FROM civic_records
    WHERE city = ${seed.city}
  `;
  const monitored = Number(
    (countRows[0] as Record<string, unknown> | undefined)?.monitored ?? 0,
  );

  const titleName = civicDisplayName(seed);
  return {
    title: `${titleName} Public Records Audit — Beleg`,
    description:
      seed.type === "federal"
        ? `Cryptographic monitoring of ${monitored} federal public records. Every file hashed and Bitcoin-anchored daily.`
        : `Cryptographic monitoring of ${monitored} public records from ${seed.city}'s open data portal. Every file hashed and Bitcoin-anchored daily.`,
    alternates: {
      canonical: `${SITE_URL}/audit/${citySlug(seed.city)}`,
    },
  };
}

export default async function CityAuditPage({
  params,
}: {
  params: Promise<CityParams>;
}) {
  const { city: slug } = await params;
  const seed = findCityBySlug(slug);
  if (!seed) notFound();

  const [recordRows, changeRows, latestRows, statsRows] = await Promise.all([
    sql`
      SELECT
        id, city, state, dataset_id, dataset_name, resource_url, file_hash,
        file_size, retrieved_at, ots_proof, anchor_status, bitcoin_block_height
      FROM civic_records
      WHERE city = ${seed.city}
      ORDER BY retrieved_at DESC
    `,
    sql`
      SELECT *
      FROM (
        SELECT DISTINCT ON (resource_url)
          id, city, state, dataset_name, resource_url, old_hash, new_hash,
          detected_at, change_type, content_diff, story
        FROM civic_changes
        WHERE city = ${seed.city}
        ORDER BY resource_url, detected_at DESC
      ) latest
      ORDER BY detected_at DESC
      LIMIT 100
    `,
    sql`
      SELECT DISTINCT ON (resource_url)
        id, city, state, dataset_id, dataset_name, resource_url, file_hash,
        file_size, retrieved_at, ots_proof, anchor_status, bitcoin_block_height
      FROM civic_records
      WHERE city = ${seed.city}
      ORDER BY resource_url, retrieved_at DESC
    `,
    sql`
      SELECT
        (SELECT count(DISTINCT resource_url)::int FROM civic_records WHERE city = ${seed.city}) AS monitored,
        (SELECT max(retrieved_at) FROM civic_records WHERE city = ${seed.city}) AS last_checked,
        (SELECT count(*)::int FROM civic_changes WHERE city = ${seed.city}) AS changes,
        (SELECT count(*)::int FROM civic_records WHERE city = ${seed.city} AND anchor_status = 'confirmed') AS anchors
    `,
  ]);

  const records = [...recordRows].map((row) =>
    mapRecord(row as Record<string, unknown>),
  );
  const changes = [...changeRows].map((row) =>
    mapChange(row as Record<string, unknown>),
  );
  const latest = [...latestRows].map((row) =>
    mapRecord(row as Record<string, unknown>),
  );
  const statsRow = statsRows[0] as Record<string, unknown> | undefined;
  const monitored = Number(statsRow?.monitored ?? 0);
  const lastChecked = statsRow?.last_checked
    ? formatWhen(asTimestamp(statsRow.last_checked))
    : "Not yet";
  const changeCount = Number(statsRow?.changes ?? 0);
  const anchorCount = Number(statsRow?.anchors ?? 0);

  return (
    <main className="page civic-page">
      <div className="civic-inner">
        <header className="doc-header">
          <nav className="civic-crumb" aria-label="Breadcrumb">
            <Link href="/audit">Audit</Link>
            <span aria-hidden="true"> / </span>
            <span>{civicDisplayName(seed)}</span>
          </nav>
          <p className="doc-eyebrow">Live — updated daily</p>
          <h1 className="h1 doc-title">
            {seed.type === "federal"
              ? "US Federal Government"
              : `${seed.city}, ${seed.state} Civic Audit`}
          </h1>
          <p className="lp-lead">
            {seed.type === "federal"
              ? "Beleg retrieves public files from federal sources, hashes the bytes, and keeps every snapshot. A later hash that does not match is a content change, not a verdict."
              : `Beleg retrieves public files from ${seed.city}'s open data portal, hashes the bytes, and keeps every snapshot. A later hash that does not match is a content change, not a verdict.`}
          </p>
        </header>

        <ul className="civic-stats civic-stats-4">
          <li>
            <strong>{monitored}</strong>
            <span>Records monitored</span>
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
          <h2>Changes</h2>
          <p className="civic-disclaimer">
            A change means the file content changed since last retrieval. This
            may reflect a legitimate update, correction, or deletion — not
            necessarily misconduct.
          </p>
          <CivicChangeList changes={changes} />
        </section>

        <section className="civic-section">
          <div className="civic-section-head">
            <h2>Monitored files</h2>
            <CivicProofZip
              city={seed.city}
              records={latest.map((row) => ({
                id: row.id,
                dataset_id: row.dataset_id,
                ots_proof: row.ots_proof,
              }))}
            />
          </div>
          {latest.length === 0 ? (
            <p className="civic-empty">
              No snapshots yet. The daily retrieval has not run.
            </p>
          ) : (
            <div className="civic-table-wrap">
              <table className="civic-table">
                <thead>
                  <tr>
                    <th>Dataset</th>
                    <th>URL</th>
                    <th>Hash</th>
                    <th>Checked</th>
                    <th>Anchor</th>
                    <th>Proof</th>
                  </tr>
                </thead>
                <tbody>
                  {latest.map((row) => (
                    <tr key={row.id}>
                      <td>{row.dataset_name}</td>
                      <td>
                        <a href={row.resource_url}>{row.resource_url}</a>
                      </td>
                      <td className="mono">{shortHash(row.file_hash)}</td>
                      <td>{formatWhen(row.retrieved_at)}</td>
                      <td>
                        {row.anchor_status === "confirmed" ? (
                          <span className="civic-anchor-ok">
                            ✓ Bitcoin confirmed
                            {row.bitcoin_block_height != null
                              ? ` · block ${row.bitcoin_block_height}`
                              : ""}
                          </span>
                        ) : (
                          <span className="civic-anchor-pending">Pending</span>
                        )}
                      </td>
                      <td>
                        {row.ots_proof ? (
                          <a href={`/api/civic/proof/${row.id}`}>
                            Download .ots
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="civic-section">
          <h2>Subscribe to changes</h2>
          <CivicSubscribe city={seed.city} />
        </section>

        <section className="civic-section">
          <h2>Verify a document</h2>
          <p className="lp-body">
            Paste a URL from the monitored list to see every hash we have stored
            for that file.
          </p>
          <CivicVerify
            records={records.map((row) => ({
              id: row.id,
              dataset_name: row.dataset_name,
              resource_url: row.resource_url,
              file_hash: row.file_hash,
              retrieved_at: new Date(row.retrieved_at).toISOString(),
              anchor_status: row.anchor_status,
            }))}
          />
        </section>

        <p className="civic-footnote">
          Public API available — GET /api/civic/records?city={slug}
        </p>
      </div>
      <Footer />
    </main>
  );
}
