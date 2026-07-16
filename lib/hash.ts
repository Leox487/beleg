import { createHash } from "crypto";

export const GENESIS_HASH = "0".repeat(64);

export interface EntryContent {
  venture_id: string;
  seq: number;
  kind: string;
  title: string;
  body: string | null;
  occurred_at: string | null;
  recorded_at: string;
}

// Deterministic serialization: fixed key order, no whitespace variance.
export function canonicalize(c: EntryContent): string {
  return JSON.stringify([
    c.venture_id, c.seq, c.kind, c.title,
    c.body ?? "", c.occurred_at ?? "", c.recorded_at,
  ]);
}

export function sha256Hex(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

export function contentHash(c: EntryContent): string {
  return sha256Hex(canonicalize(c));
}

export function chainHash(prevHash: string, contentHashHex: string): string {
  return sha256Hex(prevHash + contentHashHex);
}
