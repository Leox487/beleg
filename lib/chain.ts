import "server-only";

import sql from "./supabase";
import {
  GENESIS_HASH,
  chainHash,
  contentHash,
  type EntryContent,
} from "./hash";
import { mapEntry } from "./row";
import type { Entry } from "./types";

export interface AppendEntryInput {
  venture_id: string;
  kind: string;
  title: string;
  body: string | null;
  occurred_at: string | null;
  /** Provenance; defaults to 'manual'. Not included in content_hash. */
  source?: string;
  /** DKIM trust signal for email-sourced entries. Not hashed. */
  dkim_verified?: boolean | null;
}

const MAX_RETRIES = 3;

/**
 * The single code path that appends an entry to a venture's hash chain.
 *
 * Reads the chain tip (highest seq + its chain_hash, GENESIS_HASH if empty),
 * stamps recorded_at server-side, computes content_hash and chain_hash via
 * lib/hash.ts, and inserts with seq = last + 1. On a unique-constraint
 * violation of (venture_id, seq), a concurrent append race, it re-reads the
 * tip and retries up to MAX_RETRIES times.
 *
 * Caller is responsible for authorization (verifying the venture belongs to
 * the requester) before calling this.
 */
export async function appendEntry(input: AppendEntryInput): Promise<Entry> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const tip = await sql`
      SELECT seq, chain_hash FROM entries
      WHERE venture_id = ${input.venture_id}
      ORDER BY seq DESC LIMIT 1
    `;

    const lastSeq = (tip[0]?.seq as number | undefined) ?? 0;
    const prevChainHash =
      (tip[0]?.chain_hash as string | undefined) ?? GENESIS_HASH;
    const recorded_at = new Date().toISOString();

    const entry: EntryContent = {
      venture_id: input.venture_id,
      seq: lastSeq + 1,
      kind: input.kind,
      title: input.title,
      body: input.body,
      occurred_at: input.occurred_at,
      recorded_at,
    };

    const cHash = contentHash(entry);
    const chHash = chainHash(prevChainHash, cHash);

    const source = input.source?.trim() || "manual";
    const dkimVerified =
      input.dkim_verified === undefined ? null : input.dkim_verified;

    try {
      const rows = await sql`
        INSERT INTO entries (
          venture_id, seq, kind, title, body, occurred_at, recorded_at,
          content_hash, prev_hash, chain_hash, source, dkim_verified
        )
        VALUES (
          ${input.venture_id}, ${lastSeq + 1}, ${input.kind}, ${input.title},
          ${input.body}, ${input.occurred_at}, ${recorded_at},
          ${cHash}, ${prevChainHash}, ${chHash},
          ${source}, ${dkimVerified}
        )
        RETURNING
          id, venture_id, seq, kind, title, body, occurred_at, recorded_at,
          content_hash, prev_hash, chain_hash, source, dkim_verified
      `;
      return mapEntry(rows[0] as Record<string, unknown>);
    } catch (e: unknown) {
      const code =
        typeof e === "object" && e && "code" in e
          ? String((e as { code: unknown }).code)
          : "";
      if (code === "23505" && attempt < MAX_RETRIES - 1) continue;
      throw e;
    }
  }

  throw new Error("Failed to append entry after max retries");
}
