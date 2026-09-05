// Browser-side mirror of lib/hash.ts. The canonicalize() output MUST be
// byte-identical to the server's so that recomputed hashes match. Hashing uses
// the Web Crypto API (crypto.subtle) instead of Node's crypto module.

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

// Identical array order and JSON.stringify semantics as the server.
// Canonicalization normalizes timestamps because DB round-trips alter string
// representation (Postgres timestamptz returns "+00:00" where toISOString()
// emits "Z"). new Date(...).toISOString() reproduces the original insert-time
// value. occurred_at is a plain YYYY-MM-DD date and round-trips unchanged.
export function canonicalize(c: EntryContent): string {
  return JSON.stringify([
    c.venture_id, c.seq, c.kind, c.title,
    c.body ?? "", c.occurred_at ?? "",
    new Date(c.recorded_at).toISOString(),
  ]);
}

function toHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, "0");
  }
  return out;
}

export async function sha256HexBrowser(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
}

export async function contentHashBrowser(c: EntryContent): Promise<string> {
  return sha256HexBrowser(canonicalize(c));
}

export async function chainHashBrowser(
  prevHash: string,
  contentHashHex: string,
): Promise<string> {
  return sha256HexBrowser(prevHash + contentHashHex);
}
