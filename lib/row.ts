import type { Anchor, Attestation, Entry, Venture } from "./types";

/** Normalize postgres.js row values (Date → ISO / YYYY-MM-DD) for app types. */

export function asTimestamp(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  return String(value ?? "");
}

export function asDateOnly(value: unknown): string | null {
  if (value == null) return null;
  if (value instanceof Date) {
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, "0");
    const d = String(value.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  const s = String(value);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

export function asNullableString(value: unknown): string | null {
  return value == null ? null : String(value);
}

export function mapVenture(row: Record<string, unknown>): Venture {
  return {
    id: String(row.id),
    clerk_user_id: String(row.clerk_user_id),
    name: String(row.name),
    slug: String(row.slug),
    tagline: asNullableString(row.tagline),
    created_at: asTimestamp(row.created_at),
  };
}

export function mapEntry(row: Record<string, unknown>): Entry {
  return {
    id: String(row.id),
    venture_id: String(row.venture_id),
    seq: Number(row.seq),
    kind: String(row.kind),
    title: String(row.title),
    body: asNullableString(row.body),
    occurred_at: asDateOnly(row.occurred_at),
    recorded_at: asTimestamp(row.recorded_at),
    content_hash: String(row.content_hash),
    prev_hash: String(row.prev_hash),
    chain_hash: String(row.chain_hash),
  };
}

export function mapAttestation(row: Record<string, unknown>): Attestation {
  return {
    id: String(row.id),
    venture_id: String(row.venture_id),
    entry_id: asNullableString(row.entry_id),
    attester_email: String(row.attester_email),
    attester_name: asNullableString(row.attester_name),
    statement: String(row.statement),
    attester_note: asNullableString(row.attester_note),
    token: String(row.token),
    status: String(row.status),
    requested_at: asTimestamp(row.requested_at),
    confirmed_at: row.confirmed_at == null ? null : asTimestamp(row.confirmed_at),
    chain_entry_id: asNullableString(row.chain_entry_id),
  };
}

export function mapAnchor(row: Record<string, unknown>): Anchor {
  return {
    id: String(row.id),
    venture_id: String(row.venture_id),
    anchored_seq: Number(row.anchored_seq),
    chain_tip_hash: String(row.chain_tip_hash),
    ots_proof: String(row.ots_proof ?? ""),
    status: String(row.status),
    created_at: asTimestamp(row.created_at),
    upgraded_at:
      row.upgraded_at == null ? null : asTimestamp(row.upgraded_at),
    bitcoin_block_height:
      row.bitcoin_block_height == null
        ? null
        : Number(row.bitcoin_block_height),
  };
}
