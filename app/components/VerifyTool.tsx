"use client";

import { useState } from "react";

import { FormError } from "@/app/components/FormError";

import {
  GENESIS_HASH,
  chainHashBrowser,
  contentHashBrowser,
} from "@/lib/hash-browser";
import type { Entry } from "@/lib/types";

interface RowResult {
  seq: number;
  computedContent: string;
  storedContent: string;
  computedChain: string;
  storedChain: string;
  prevHash: string;
  ok: boolean;
}

type Result =
  | { state: "ok"; firstRecordedAt: string; count: number; rows: RowResult[] }
  | { state: "broken"; seq: number; reason: string; rows: RowResult[] };

function trunc(hash: string): string {
  return `${hash.slice(0, 24)}…`;
}

/**
 * Accepts a full proof-page URL or a bare slug and returns the slug.
 * Returns null when the input clearly isn't either.
 */
function extractSlug(raw: string): string | null {
  const input = raw.trim();
  if (!input) return null;

  // Bare slug: no scheme, no slashes.
  if (/^[a-z0-9][a-z0-9-]*$/i.test(input)) return input;

  let path = input;
  try {
    path = new URL(input.includes("://") ? input : `https://${input}`).pathname;
  } catch {
    return null;
  }

  const match = path.match(/\/p\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/** Same four checks the proof page's verifier runs, in the same order. */
async function verifyEntries(entries: Entry[]): Promise<Result> {
  const ordered = [...entries].sort((a, b) => a.seq - b.seq);
  const rows: RowResult[] = [];
  let prevChain = GENESIS_HASH;

  for (let i = 0; i < ordered.length; i++) {
    const e = ordered[i];
    const expectedSeq = i + 1;

    const computedContent = await contentHashBrowser({
      venture_id: e.venture_id,
      seq: e.seq,
      kind: e.kind,
      title: e.title,
      body: e.body,
      occurred_at: e.occurred_at,
      recorded_at: e.recorded_at,
    });
    const computedChain = await chainHashBrowser(e.prev_hash, computedContent);

    const row: RowResult = {
      seq: e.seq,
      computedContent,
      storedContent: e.content_hash,
      computedChain,
      storedChain: e.chain_hash,
      prevHash: e.prev_hash,
      ok: true,
    };

    const fail = (reason: string): Result => {
      row.ok = false;
      rows.push(row);
      return { state: "broken", seq: e.seq, reason, rows };
    };

    if (e.seq !== expectedSeq) {
      return fail(`sequence gap: expected #${expectedSeq}, found #${e.seq}`);
    }
    if (computedContent !== e.content_hash) {
      return fail("content hash does not match (an entry's data was altered)");
    }
    if (e.prev_hash !== prevChain) {
      return fail(
        e.seq === 1
          ? "first entry's prev hash is not the genesis hash"
          : "prev hash does not match the previous entry's chain hash (link broken)",
      );
    }
    if (computedChain !== e.chain_hash) {
      return fail("chain hash does not match (the seal was tampered with)");
    }

    rows.push(row);
    prevChain = e.chain_hash;
  }

  return {
    state: "ok",
    firstRecordedAt: ordered.length > 0 ? ordered[0].recorded_at : "",
    count: ordered.length,
    rows,
  };
}

export function VerifyTool() {
  const [value, setValue] = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ventureName, setVentureName] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [showMath, setShowMath] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setVentureName(null);
    setShowMath(false);

    const slug = extractSlug(value);
    if (!slug) {
      setError(
        "That doesn't look like a Beleg proof page. Paste a link like beleg.app/p/your-ledger, or just the slug.",
      );
      return;
    }

    setRunning(true);
    try {
      // The endpoint pages by seq. Verification needs the whole chain, so
      // follow the cursor until the last page.
      const entries: Entry[] = [];
      let name: string | null = null;
      let afterSeq: number | null = 0;

      while (afterSeq !== null) {
        const res = await fetch(
          `/api/public/${encodeURIComponent(slug)}/entries?after_seq=${afterSeq}`,
        );

        if (res.status === 404) {
          setError(`No ledger found at that link (looked for "${slug}").`);
          return;
        }
        if (!res.ok) {
          setError("Couldn't load that ledger. Try again in a moment.");
          return;
        }

        const page = (await res.json()) as {
          venture: { name: string };
          entries: Entry[];
          has_more?: boolean;
          next_after_seq?: number | null;
        };

        name = page.venture.name;
        entries.push(...page.entries);
        afterSeq = page.has_more ? (page.next_after_seq ?? null) : null;
      }

      if (entries.length === 0) {
        setVentureName(name);
        setError("This ledger has no entries yet, so there's nothing to verify.");
        return;
      }

      setVentureName(name);
      setResult(await verifyEntries(entries));
    } catch {
      setError("Couldn't reach the server. Check your connection and retry.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="verify-tool">
      <form className="verify-tool-form" onSubmit={onSubmit}>
        <input
          className="verify-tool-input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="beleg.app/p/your-ledger"
          aria-label="Beleg proof page URL or slug"
          spellCheck={false}
          autoComplete="off"
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={running || value.trim() === ""}
        >
          {running ? <span className="btn-ellipsis">…</span> : "Verify"}
        </button>
      </form>

      <FormError className="verify-tool-error">{error}</FormError>

      {result ? (
        <div className="verify-tool-result">
          {ventureName ? (
            <p className="verify-tool-venture">{ventureName}</p>
          ) : null}

          {result.state === "ok" ? (
            <div className="verify-banner verify-ok verify-success">
              ✓ Chain verified: {result.count}{" "}
              {result.count === 1 ? "entry" : "entries"}, unbroken since{" "}
              {new Date(result.firstRecordedAt).toLocaleString()}
            </div>
          ) : (
            <div className="verify-banner verify-broken">
              ✗ Chain broken at entry #{result.seq}: {result.reason}
            </div>
          )}

          <div className="verify-math">
            <button
              type="button"
              className="verify-toggle"
              onClick={() => setShowMath((v) => !v)}
              aria-expanded={showMath}
            >
              {showMath ? "Hide the math" : "Show the math"}
            </button>

            {showMath ? (
              <div className="verify-rows">
                {result.rows.map((r) => (
                  <div
                    key={r.seq}
                    className={`verify-row${r.ok ? "" : " verify-row-bad"}`}
                  >
                    <span className="verify-row-seq">#{r.seq}</span>
                    <div className="verify-row-hashes">
                      <span>
                        content computed {trunc(r.computedContent)} · stored{" "}
                        {trunc(r.storedContent)}
                      </span>
                      <span>
                        chain computed {trunc(r.computedChain)} · stored{" "}
                        {trunc(r.storedChain)}
                      </span>
                      <span>prev {trunc(r.prevHash)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
