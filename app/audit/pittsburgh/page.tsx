import type { Metadata } from "next";

import { CivicVerify } from "@/app/components/CivicVerify";
import { Footer } from "@/app/components/Footer";
import sql from "@/lib/supabase";

import "./civic.css";

export const metadata: Metadata = {
  title: "Pittsburgh Civic Audit · Beleg",
  description:
    "SHA-256 snapshots of public Pittsburgh datasets from WPRDC, with detected file changes and OpenTimestamps proofs.",
};

export const dynamic = "force-dynamic";

type CivicRecordRow = {
  id: string;
  dataset_id: string;
  dataset_name: string;
  resource_url: string;
  file_hash: string;
  file_size: number | null;
  retrieved_at: string;
  ots_proof: string | null;
  anchor_status: string | null;
};

type CivicChangeRow = {
  id: string;
  dataset_name: string;
  resource_url: string;
  old_hash: string;
  new_hash: string;
  detected_at: string;
  change_type: string;
};

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  });
}

function shortHash(hash: string): string {
  if (hash.length <= 16) return hash;
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}

export default async function PittsburghAuditPage() {
  const [recordRows, changeRows, latestRows, statsRows] = await Promise.all([
    sql`
      SELECT
        id, dataset_id, dataset_name, resource_url, file_hash, file_size,
        retrieved_at, ots_proof, anchor_status
      FROM civic_records
      ORDER BY retrieved_at DESC
    `,
    sql`
      SELECT
        id, dataset_name, resource_url, old_hash, new_hash, detected_at,
        change_type
      FROM civic_changes
      ORDER BY detected_at DESC
      LIMIT 100
    `,
    sql`
      SELECT DISTINCT ON (resource_url)
        id, dataset_id, dataset_name, resource_url, file_hash, file_size,
        retrieved_at, ots_proof, anchor_status
      FROM civic_records
      ORDER BY resource_url, retrieved_at DESC
    `,
    sql`
      SELECT
        (SELECT count(DISTINCT resource_url)::int FROM civic_records) AS monitored,
        (SELECT max(retrieved_at) FROM civic_records) AS last_checked,
        (SELECT count(*)::int FROM civic_changes) AS changes
    `,
  ]);

  const records = recordRows as CivicRecordRow[];
  const changes = changeRows as CivicChangeRow[];
  const latest = latestRows as CivicRecordRow[];
  const stats = statsRows[0] as
    | { monitored: number; last_checked: string | null; changes: number }
    | undefined;

  const monitored = stats?.monitored ?? 0;
  const lastChecked = stats?.last_checked
    ? formatWhen(stats.last_checked)
    : "Not yet";
  const changeCount = stats?.changes ?? 0;

  return (
    <main className="page civic-page">
      <div className="civic-inner">
        <header className="doc-header">
          <p className="doc-eyebrow">Cryptographic public record monitor</p>
          <h1 className="h1 doc-title">Pittsburgh Civic Audit</h1>
          <p className="lp-lead">
            Beleg retrieves public files from the Western Pennsylvania Regional
            Data Center, hashes the bytes, and keeps every snapshot. A later
            hash that does not match is a content change, not a verdict.
          </p>
        </header>

        <ul className="civic-stats">
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
        </ul>

        <section className="civic-section">
          <h2>Changes</h2>
          <p className="civic-disclaimer">
            A change means the file content changed since last retrieval. This
            may reflect a legitimate update, correction, or deletion — not
            necessarily misconduct.
          </p>
          {changes.length === 0 ? (
            <p className="civic-empty">No content changes recorded yet.</p>
          ) : (
            <ul className="civic-changes">
              {changes.map((row) => (
                <li key={row.id}>
                  <p className="civic-change-name">{row.dataset_name}</p>
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
          )}
        </section>

        <section className="civic-section">
          <h2>Monitored files</h2>
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
                      <td>{row.anchor_status ?? "pending"}</td>
                      <td>
                        {row.ots_proof ? (
                          <a href={`/api/civic/proof/${row.id}`}>Download .ots</a>
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
      </div>
      <Footer />
    </main>
  );
}
