import {
  parseStoredDiff,
  type CivicContentDiff,
} from "@/lib/civic-diff";
import { asNullableString, asTimestamp } from "@/lib/row";

export type CivicRecordRow = {
  id: string;
  city: string;
  state: string;
  dataset_id: string;
  dataset_name: string;
  resource_url: string;
  file_hash: string;
  file_size: number | null;
  retrieved_at: string;
  ots_proof: string | null;
  anchor_status: string | null;
  bitcoin_block_height: number | null;
};

export type CivicChangeRow = {
  id: string;
  city: string | null;
  state: string | null;
  dataset_name: string;
  resource_url: string;
  old_hash: string;
  new_hash: string;
  detected_at: string;
  change_type: string;
  content_diff: CivicContentDiff | null;
};

export function formatWhen(iso: string): string {
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

export function shortHash(hash: string): string {
  if (hash.length <= 16) return hash;
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}

export function mapRecord(row: Record<string, unknown>): CivicRecordRow {
  return {
    id: String(row.id),
    city: String(row.city ?? "Pittsburgh"),
    state: String(row.state ?? "PA"),
    dataset_id: String(row.dataset_id),
    dataset_name: String(row.dataset_name),
    resource_url: String(row.resource_url),
    file_hash: String(row.file_hash),
    file_size: row.file_size == null ? null : Number(row.file_size),
    retrieved_at: asTimestamp(row.retrieved_at),
    ots_proof: asNullableString(row.ots_proof),
    anchor_status: asNullableString(row.anchor_status),
    bitcoin_block_height:
      row.bitcoin_block_height == null
        ? null
        : Number(row.bitcoin_block_height),
  };
}

export function mapChange(row: Record<string, unknown>): CivicChangeRow {
  return {
    id: String(row.id),
    city: row.city == null ? null : String(row.city),
    state: row.state == null ? null : String(row.state),
    dataset_name: String(row.dataset_name),
    resource_url: String(row.resource_url),
    old_hash: String(row.old_hash),
    new_hash: String(row.new_hash),
    detected_at: asTimestamp(row.detected_at),
    change_type: String(row.change_type ?? "content_modified"),
    content_diff: parseStoredDiff(row.content_diff),
  };
}
