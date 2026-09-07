import { CivicFlag } from "@/app/components/CivicFlag";
import { formatWhen, type CivicChangeRow } from "@/app/audit/civic-map";

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
