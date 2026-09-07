import { CivicFlag } from "@/app/components/CivicFlag";
import { formatWhen, type CivicChangeRow } from "@/app/audit/civic-map";
import { formatDiffSummary } from "@/lib/civic-diff";

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
        return (
          <li key={row.id}>
            <p className="civic-change-name">
              {showCity && row.city ? `${cityLabel} · ` : null}
              {row.dataset_name}
            </p>
            <p className="civic-change-label">
              FILE CONTENT CHANGED — source: {row.resource_url}
            </p>
            <a href={row.resource_url}>{row.resource_url}</a>
            <p className="civic-change-meta">
              Detected {formatWhen(row.detected_at)}
            </p>
            {diff ? (
              <>
                <p className="civic-diff-summary">{formatDiffSummary(diff)}</p>
                <pre className="civic-diff-block">
                  {diff.added_preview.slice(0, 3).map((line) => (
                    <span key={`a-${line}`} className="civic-diff-add">
                      + {line}
                      {"\n"}
                    </span>
                  ))}
                  {diff.removed_preview.slice(0, 3).map((line) => (
                    <span key={`r-${line}`} className="civic-diff-del">
                      - {line}
                      {"\n"}
                    </span>
                  ))}
                  {diff.modified_preview.slice(0, 3).map((line) => (
                    <span key={`m-${line.old}`} className="civic-diff-mod">
                      ~ {line.old}
                      {" → "}
                      {line.new}
                      {"\n"}
                    </span>
                  ))}
                </pre>
              </>
            ) : null}
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
