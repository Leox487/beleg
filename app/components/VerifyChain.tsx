"use client";

import { useCallback, useEffect, useState } from "react";

import {
  GENESIS_HASH,
  chainHashBrowser,
  contentHashBrowser,
} from "@/lib/hash-browser";
import type { Entry } from "@/lib/types";

type VerifyEntry = Pick<
  Entry,
  | "venture_id"
  | "seq"
  | "kind"
  | "title"
  | "body"
  | "occurred_at"
  | "recorded_at"
  | "content_hash"
  | "prev_hash"
  | "chain_hash"
>;

interface RowResult {
  seq: number;
  computedContent: string;
  storedContent: string;
  computedChain: string;
  storedChain: string;
  prevHash: string;
  ok: boolean;
}

type Status =
  | { state: "idle" }
  | { state: "running" }
  | { state: "ok"; firstRecordedAt: string; count: number; rows: RowResult[] }
  | { state: "broken"; seq: number; reason: string; rows: RowResult[] };

function trunc(hash: string): string {
  return `${hash.slice(0, 16)}…`;
}

export function VerifyChain({ entries }: { entries: VerifyEntry[] }) {
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [showMath, setShowMath] = useState(false);

  const verify = useCallback(async () => {
    setStatus({ state: "running" });

    // Work on a seq-ascending copy regardless of incoming order.
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

      // (d) seq runs 1..N with no gaps
      if (e.seq !== expectedSeq) {
        row.ok = false;
        rows.push(row);
        setStatus({
          state: "broken",
          seq: e.seq,
          reason: `sequence gap — expected #${expectedSeq}, found #${e.seq}`,
          rows,
        });
        return;
      }

      // (a) recomputed content hash === stored content_hash
      if (computedContent !== e.content_hash) {
        row.ok = false;
        rows.push(row);
        setStatus({
          state: "broken",
          seq: e.seq,
          reason: "content hash does not match (an entry's data was altered)",
          rows,
        });
        return;
      }

      // (b) prev_hash === previous entry's chain_hash (GENESIS for #1)
      if (e.prev_hash !== prevChain) {
        row.ok = false;
        rows.push(row);
        setStatus({
          state: "broken",
          seq: e.seq,
          reason:
            e.seq === 1
              ? "first entry's prev hash is not the genesis hash"
              : "prev hash does not match the previous entry's chain hash (link broken)",
          rows,
        });
        return;
      }

      // (c) recomputed chain hash === stored chain_hash
      if (computedChain !== e.chain_hash) {
        row.ok = false;
        rows.push(row);
        setStatus({
          state: "broken",
          seq: e.seq,
          reason: "chain hash does not match (the seal was tampered with)",
          rows,
        });
        return;
      }

      rows.push(row);
      prevChain = e.chain_hash;
    }

    if (ordered.length === 0) {
      setStatus({
        state: "ok",
        firstRecordedAt: "",
        count: 0,
        rows,
      });
      return;
    }

    setStatus({
      state: "ok",
      firstRecordedAt: ordered[0].recorded_at,
      count: ordered.length,
      rows,
    });
  }, [entries]);

  useEffect(() => {
    void verify();
  }, [verify]);

  const rows =
    status.state === "ok" || status.state === "broken" ? status.rows : [];

  return (
    <section className="verify">
      <div className="verify-head">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => void verify()}
          disabled={status.state === "running"}
        >
          Verify chain
        </button>
      </div>

      {status.state === "running" ? (
        <div className="verify-banner verify-running">
          Verifying {entries.length}{" "}
          {entries.length === 1 ? "entry" : "entries"}…
        </div>
      ) : null}

      {status.state === "ok" ? (
        <div className="verify-banner verify-ok">
          {status.count === 0
            ? "✓ Nothing to verify yet — this ledger has no entries."
            : `✓ Chain verified — ${status.count} ${
                status.count === 1 ? "entry" : "entries"
              }, unbroken since ${new Date(
                status.firstRecordedAt,
              ).toLocaleString()}`}
        </div>
      ) : null}

      {status.state === "broken" ? (
        <div className="verify-banner verify-broken">
          ✗ Chain broken at entry #{status.seq} — {status.reason}
        </div>
      ) : null}

      {rows.length > 0 ? (
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
              {rows.map((r) => (
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
      ) : null}
    </section>
  );
}
