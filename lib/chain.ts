import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase";
import {
  GENESIS_HASH,
  chainHash,
  contentHash,
  type EntryContent,
} from "@/lib/hash";
import type { Entry } from "@/lib/types";

export interface AppendEntryInput {
  venture_id: string;
  kind: string;
  title: string;
  body: string | null;
  occurred_at: string | null;
}

const MAX_ATTEMPTS = 3;
const UNIQUE_VIOLATION = "23505";

/**
 * The single code path that appends an entry to a venture's hash chain.
 *
 * Reads the chain tip (highest seq + its chain_hash, GENESIS_HASH if empty),
 * stamps recorded_at server-side, computes content_hash and chain_hash via
 * lib/hash.ts, and inserts with seq = last + 1. On a unique-constraint
 * violation of (venture_id, seq) — a concurrent append race — it re-reads the
 * tip and retries up to MAX_ATTEMPTS times.
 *
 * Caller is responsible for authorization (verifying the venture belongs to
 * the requester) before calling this.
 */
export async function appendEntry(input: AppendEntryInput): Promise<Entry> {
  const supabase = createSupabaseServiceRoleClient();

  let lastError: unknown = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    // Fetch the current chain tip: highest seq and its chain_hash.
    const { data: lastEntry, error: lastError2 } = await supabase
      .from("entries")
      .select("seq, chain_hash")
      .eq("venture_id", input.venture_id)
      .order("seq", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastError2) {
      throw new Error(`Failed to load chain tip: ${lastError2.message}`);
    }

    const prevHash = lastEntry?.chain_hash ?? GENESIS_HASH;
    const seq = (lastEntry?.seq ?? 0) + 1;

    // recorded_at is set server-side, never trusted from the client.
    const recordedAt = new Date().toISOString();

    const content: EntryContent = {
      venture_id: input.venture_id,
      seq,
      kind: input.kind,
      title: input.title,
      body: input.body,
      occurred_at: input.occurred_at,
      recorded_at: recordedAt,
    };

    const contentHashHex = contentHash(content);
    const chainHashHex = chainHash(prevHash, contentHashHex);

    const { data: inserted, error: insertError } = await supabase
      .from("entries")
      .insert({
        venture_id: input.venture_id,
        seq,
        kind: input.kind,
        title: input.title,
        body: input.body,
        occurred_at: input.occurred_at,
        recorded_at: recordedAt,
        content_hash: contentHashHex,
        prev_hash: prevHash,
        chain_hash: chainHashHex,
      })
      .select(
        "id, venture_id, seq, kind, title, body, occurred_at, recorded_at, content_hash, prev_hash, chain_hash",
      )
      .single();

    if (!insertError && inserted) {
      return inserted as Entry;
    }

    lastError = insertError;

    // Concurrent append grabbed our seq — re-read the tip and retry.
    if (insertError && insertError.code === UNIQUE_VIOLATION) {
      continue;
    }

    // Any other error is not retryable.
    throw new Error(
      `Failed to append entry: ${insertError?.message ?? "unknown error"}`,
    );
  }

  throw new Error(
    `Failed to append entry after ${MAX_ATTEMPTS} attempts (seq contention): ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`,
  );
}
