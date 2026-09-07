"use client";

import { useMemo, useState } from "react";

export type CivicSnapshot = {
  id: string;
  dataset_name: string;
  resource_url: string;
  file_hash: string;
  retrieved_at: string;
  anchor_status: string | null;
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

export function CivicVerify({ records }: { records: CivicSnapshot[] }) {
  const [url, setUrl] = useState("");
  const watched = useMemo(
    () => new Set(records.map((row) => row.resource_url)),
    [records],
  );
  const trimmed = url.trim();
  const history = useMemo(() => {
    if (!trimmed) return [];
    return records
      .filter((row) => row.resource_url === trimmed)
      .sort(
        (a, b) =>
          new Date(b.retrieved_at).getTime() -
          new Date(a.retrieved_at).getTime(),
      );
  }, [records, trimmed]);

  const unknown = trimmed.length > 0 && !watched.has(trimmed);

  return (
    <form className="civic-verify" onSubmit={(event) => event.preventDefault()}>
      <label className="civic-verify-label" htmlFor="civic-url">
        Resource URL
      </label>
      <input
        id="civic-url"
        className="civic-verify-input"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        placeholder="Paste a monitored resource URL"
        autoComplete="off"
        spellCheck={false}
      />
      {unknown ? (
        <p className="civic-verify-empty">
          That URL is not in the monitored list.
        </p>
      ) : null}
      {history.length > 0 ? (
        <ol className="civic-history">
          {history.map((row) => (
            <li key={row.id}>
              <span className="mono">{row.file_hash}</span>
              <span>{formatWhen(row.retrieved_at)}</span>
              <span>{row.anchor_status ?? "pending"}</span>
            </li>
          ))}
        </ol>
      ) : null}
      {trimmed && !unknown && history.length === 0 ? (
        <p className="civic-verify-empty">No snapshots for this URL yet.</p>
      ) : null}
    </form>
  );
}
