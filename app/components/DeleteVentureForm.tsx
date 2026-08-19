"use client";

import { useState } from "react";

const CONFIRM_WORD = "Confirm";

async function readError(res: Response): Promise<string> {
  try {
    const d = (await res.json()) as { error?: string };
    return d.error ?? "Failed to delete";
  } catch {
    return "Failed to delete";
  }
}

export function DeleteVentureForm({
  ventureId,
}: {
  ventureId: string;
}) {
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    if (confirm !== CONFIRM_WORD) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ventures/${ventureId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setError(await readError(res));
        return;
      }
      window.location.assign("/dashboard");
    } catch {
      setError("Failed to delete");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="danger-zone">
      <p className="muted">
        Permanently delete this venture and its entire ledger. This cannot be
        undone.
      </p>
      <label className="danger-confirm-label" htmlFor="confirm-delete">
        Type <span className="confirm-phrase">{CONFIRM_WORD}</span> to delete
      </label>
      <input
        id="confirm-delete"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        className="settings-input"
        autoComplete="off"
        spellCheck={false}
        placeholder={CONFIRM_WORD}
      />
      <button
        type="button"
        className="btn btn-danger"
        disabled={loading || confirm !== CONFIRM_WORD}
        onClick={() => void onDelete()}
      >
        {loading ? "Deleting…" : "Delete venture"}
      </button>
      {error ? <p className="settings-error">{error}</p> : null}
    </div>
  );
}
