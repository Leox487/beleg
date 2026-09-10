import { CivicFlag } from "@/app/components/CivicFlag";
import { formatWhen, type CivicChangeRow } from "@/app/audit/civic-map";
import {
  formatDiffSummary,
  type CivicDiffSummary,
} from "@/lib/civic-diff";

export function CivicChangeList({
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
      {changes.map((row) => {
        const cityLabel = row.city
          ? `${row.city}${row.state ? `, ${row.state}` : ""}`
          : "unknown";
        const diff = row.content_diff;
        const headline = diff?.notable_changes[0] ?? null;
        return (
          <li key={row.id}>
            <p className="civic-change-name">
              {showCity && row.city ? `${cityLabel} · ` : null}
              {row.dataset_name}
            </p>
            {headline ? (
              <p className="civic-change-headline">{headline}</p>
            ) : (
              <p className="civic-change-label">
                FILE CONTENT CHANGED — source: {row.resource_url}
              </p>
            )}
            <a href={row.resource_url}>{row.resource_url}</a>
            <p className="civic-change-meta">
              Detected {formatWhen(row.detected_at)}
            </p>
            {diff ? <CivicDiffDetails diff={diff} /> : null}
            <p className="mono civic-hashes civic-hashes-full">
              <span>
                <em>Old</em> {row.old_hash}
              </span>
              <span>
                <em>New</em> {row.new_hash}
              </span>
            </p>
            <CivicFlag changeId={row.id} city={row.city ?? cityLabel} />
          </li>
        );
      })}
    </ul>
  );
}

function CivicDiffDetails({ diff }: { diff: CivicDiffSummary }) {
  const banner = formatDiffSummary(diff);
  return (
    <div className="civic-diff">
      {banner ? (
        <p className="civic-diff-pills" aria-label={banner}>
          {diff.rows_added > 0 ? (
            <span className="civic-pill civic-pill-add">
              +{diff.rows_added} rows added
            </span>
          ) : null}
          {diff.rows_removed > 0 ? (
            <span className="civic-pill civic-pill-del">
              {diff.rows_removed} rows removed
            </span>
          ) : null}
          {diff.rows_modified > 0 ? (
            <span className="civic-pill civic-pill-mod">
              {diff.rows_modified} rows modified
            </span>
          ) : null}
        </p>
      ) : null}
      {diff.notable_changes.length > 0 ? (
        <div className="civic-notable">
          {diff.notable_changes.map((note) => (
            <p key={note}>{note}</p>
          ))}
        </div>
      ) : null}
      {diff.sample_added.length > 0 ? (
        <SampleTable
          title="Sample new entries"
          columns={displayColumns(diff.columns, diff.sample_added)}
          rows={diff.sample_added}
        />
      ) : null}
      {diff.sample_removed.length > 0 ? (
        <SampleTable
          title="Sample removed entries"
          columns={displayColumns(diff.columns, diff.sample_removed)}
          rows={diff.sample_removed}
        />
      ) : null}
      {diff.sample_modified.length > 0 ? (
        <details className="civic-diff-sample">
          <summary>Sample modified entries</summary>
          {diff.sample_modified.map((sample, index) => {
            const columns = displayColumns(diff.columns, [sample.before, sample.after], sample.changed_fields);
            return (
              <table key={`mod-${index}`} className="civic-table civic-mini-table">
                <thead>
                  <tr>
                    <th> </th>
                    {columns.map((column) => (
                      <th key={column}>{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Before</th>
                    {columns.map((column) => (
                      <td
                        key={`b-${column}`}
                        className={
                          sample.changed_fields.includes(column)
                            ? "civic-diff-del"
                            : undefined
                        }
                      >
                        {sample.before[column] ?? ""}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th scope="row">After</th>
                    {columns.map((column) => (
                      <td
                        key={`a-${column}`}
                        className={
                          sample.changed_fields.includes(column)
                            ? "civic-diff-add"
                            : undefined
                        }
                      >
                        {sample.after[column] ?? ""}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            );
          })}
        </details>
      ) : null}
    </div>
  );
}

function SampleTable({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: string[];
  rows: Record<string, string>[];
}) {
  return (
    <details className="civic-diff-sample">
      <summary>{title}</summary>
      <table className="civic-table civic-mini-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${title}-${index}`}>
              {columns.map((column) => (
                <td key={column}>{row[column] ?? ""}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

function displayColumns(
  preferred: string[],
  rows: Record<string, string>[],
  changed: string[] = [],
): string[] {
  const keys = new Set<string>();
  if (preferred[0]) keys.add(preferred[0]);
  for (const field of changed) keys.add(field);
  for (const column of preferred) keys.add(column);
  for (const row of rows) {
    for (const key of Object.keys(row)) keys.add(key);
  }
  return [...keys].slice(0, 8);
}
