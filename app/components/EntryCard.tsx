import type { Attestation, Entry } from "@/lib/types";
import { CopyText } from "@/app/components/CopyText";
import { DkimChip } from "@/app/components/DkimChip";
import { RequestAttestForm } from "@/app/components/RequestAttestForm";

function padSeq(seq: number): string {
  return String(seq).padStart(2, "0");
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function EntryCard({
  entry,
  pending = [],
  showAttest = false,
}: {
  entry: Entry;
  pending?: Attestation[];
  showAttest?: boolean;
}) {
  const isAttestation = entry.kind === "attestation";
  const isEmail = entry.source === "email" || entry.kind === "email";
  const isStripe = entry.source === "stripe";

  const tone = isAttestation
    ? "ledger-card-attest"
    : isStripe
      ? "ledger-card-stripe"
      : isEmail
        ? "ledger-card-email"
        : "";

  return (
    <div className="chain-item">
      <span className="chain-index">#{padSeq(entry.seq)}</span>
      <article className={`ledger-card ${tone}`.trim()}>
        <div className="ledger-card-zone1">
          <div className="ledger-card-pills">
            <span className="ledger-pill ledger-pill-kind">
              {isAttestation ? "attestation" : entry.kind}
            </span>
            {isEmail ? (
              <span className="ledger-pill ledger-pill-email">EMAIL</span>
            ) : null}
            {isEmail ? <DkimChip verified={entry.dkim_verified} /> : null}
            {isStripe ? (
              <span className="ledger-pill ledger-pill-stripe">STRIPE</span>
            ) : null}
          </div>
          <time className="ledger-card-date" dateTime={entry.recorded_at}>
            {formatDateTime(entry.recorded_at)}
          </time>
        </div>

        <div className="ledger-card-zone2">
          <h3 className="ledger-card-title">{entry.title}</h3>
          {entry.body ? (
            <p className="ledger-card-body">{entry.body}</p>
          ) : null}
        </div>

        <div className="ledger-card-zone3">
          <div className="ledger-card-meta">
            <span className="ledger-seal-label">SEAL</span>
            <span className="ledger-seal-hash">
              {entry.chain_hash.slice(0, 24)}…
            </span>
            {entry.occurred_at ? (
              <span className="ledger-card-occurred">
                Occurred {formatDate(entry.occurred_at)}
              </span>
            ) : null}
          </div>

          {showAttest && !isAttestation ? (
            <div className="ledger-card-actions">
              {pending.map((a) => (
                <div key={a.id} className="attest-pending muted">
                  <span>Awaiting confirmation from {a.attester_email}</span>
                  <CopyText value={`/attest/${a.token}`} />
                </div>
              ))}
              <RequestAttestForm entryId={entry.id} />
            </div>
          ) : null}
        </div>
      </article>
    </div>
  );
}
