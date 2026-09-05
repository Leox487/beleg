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

type BitcoinResult =
  | { state: "idle" }
  | { state: "running" }
  | { state: "skipped"; message: string }
  | { state: "ok"; message: string }
  | { state: "failed"; message: string };

function trunc(hash: string): string {
  return `${hash.slice(0, 24)}…`;
}

export function VerifyChain({
  entries,
  ventureId,
}: {
  entries: VerifyEntry[];
  ventureId: string;
}) {
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [bitcoin, setBitcoin] = useState<BitcoinResult>({ state: "idle" });
  const [showMath, setShowMath] = useState(false);

  const verifyChain = useCallback(async () => {
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

      if (e.seq !== expectedSeq) {
        row.ok = false;
        rows.push(row);
        setStatus({
          state: "broken",
          seq: e.seq,
          reason: `sequence gap: expected #${expectedSeq}, found #${e.seq}`,
          rows,
        });
        return false;
      }

      if (computedContent !== e.content_hash) {
        row.ok = false;
        rows.push(row);
        setStatus({
          state: "broken",
          seq: e.seq,
          reason: "content hash does not match (an entry's data was altered)",
          rows,
        });
        return false;
      }

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
        return false;
      }

      if (computedChain !== e.chain_hash) {
        row.ok = false;
        rows.push(row);
        setStatus({
          state: "broken",
          seq: e.seq,
          reason: "chain hash does not match (the seal was tampered with)",
          rows,
        });
        return false;
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
      return true;
    }

    setStatus({
      state: "ok",
      firstRecordedAt: ordered[0].recorded_at,
      count: ordered.length,
      rows,
    });
    return true;
  }, [entries]);

  const verifyBitcoin = useCallback(async () => {
    setBitcoin({ state: "running" });

    try {
      const res = await fetch(`/api/venture/${ventureId}`);
      const data = (await res.json()) as {
        ots_file_base64?: string | null;
        latest_hash?: string | null;
        error?: string;
      };

      if (!res.ok) {
        setBitcoin({
          state: "failed",
          message: data.error || "Could not load venture proof data.",
        });
        return;
      }

      if (!data.ots_file_base64) {
        setBitcoin({
          state: "skipped",
          message: "This venture has not been Bitcoin-anchored yet.",
        });
        return;
      }

      if (!data.latest_hash) {
        setBitcoin({
          state: "failed",
          message: "No chain tip hash available to verify against.",
        });
        return;
      }

      // OpenTimestamps is Node-only; the browser fetches the proof + tip hash,
      // then asks /api/verify-bitcoin to run the Merkle check (which itself
      // pulls block headers from Blockstream / our proxy).
      const verifyRes = await fetch("/api/verify-bitcoin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ots_file_base64: data.ots_file_base64,
          ledger_hash: data.latest_hash,
        }),
      });
      const result = (await verifyRes.json()) as {
        verified?: boolean;
        blockHeight?: number;
        error?: string;
      };

      if (result.verified) {
        setBitcoin({
          state: "ok",
          message: `Bitcoin-anchored at block #${result.blockHeight}. The hash existed then. That is not a finding about the event.`,
        });
      } else {
        setBitcoin({
          state: "failed",
          message: `Verification failed: ${result.error || "Unknown error"}`,
        });
      }
    } catch (error) {
      setBitcoin({
        state: "failed",
        message:
          "Verification error: " +
          (error instanceof Error ? error.message : "unknown"),
      });
    }
  }, [ventureId]);

  const verify = useCallback(async () => {
    const chainOk = await verifyChain();
    if (chainOk) {
      await verifyBitcoin();
    } else {
      setBitcoin({ state: "idle" });
    }
  }, [verifyChain, verifyBitcoin]);

  useEffect(() => {
    void verify();
  }, [verify]);

  // After a green verification, pulse the proof-page chain connectors once.
  useEffect(() => {
    const chain = document.querySelector(".chain");
    if (!chain) return;
    if (status.state === "ok" && status.count > 0) {
      chain.classList.add("chain-verified");
    } else {
      chain.classList.remove("chain-verified");
    }
    return () => chain.classList.remove("chain-verified");
  }, [status]);

  const rows =
    status.state === "ok" || status.state === "broken" ? status.rows : [];
  const busy = status.state === "running" || bitcoin.state === "running";

  return (
    <section className="verify">
      <div className="verify-head">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => void verify()}
          disabled={busy}
        >
          {busy ? <span className="btn-ellipsis">…</span> : "Verify chain"}
        </button>
        <p className="verify-note">
          Your browser recomputes every hash, then checks the Bitcoin
          OpenTimestamps proof against public block headers. This server is
          not trusted with the chain answer.
        </p>
      </div>

      {status.state === "running" ? (
        <div className="verify-banner verify-running">
          Verifying {entries.length}{" "}
          {entries.length === 1 ? "entry" : "entries"}…
        </div>
      ) : null}

      {status.state === "ok" ? (
        <div className="verify-banner verify-ok verify-success">
          {status.count === 0
            ? "✓ Nothing to verify yet. This ledger has no entries."
            : `✓ Chain verified: ${status.count} ${
                status.count === 1 ? "entry" : "entries"
              }, unbroken since ${new Date(
                status.firstRecordedAt,
              ).toLocaleString()}`}
        </div>
      ) : null}

      {status.state === "broken" ? (
        <div className="verify-banner verify-broken">
          ✗ Chain broken at entry #{status.seq}: {status.reason}
        </div>
      ) : null}

      {bitcoin.state === "running" ? (
        <div className="verify-banner verify-running">
          Checking Bitcoin OpenTimestamps proof…
        </div>
      ) : null}

      {bitcoin.state === "ok" ? (
        <div className="verify-banner verify-ok verify-success">
          ✓ {bitcoin.message}
        </div>
      ) : null}

      {bitcoin.state === "skipped" ? (
        <div className="verify-banner verify-running">{bitcoin.message}</div>
      ) : null}

      {bitcoin.state === "failed" ? (
        <div className="verify-banner verify-broken">✗ {bitcoin.message}</div>
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
