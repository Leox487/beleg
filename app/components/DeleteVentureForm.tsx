"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteVentureForm({
  ventureId,
  ventureName,
}: {
  ventureId: string;
  ventureName: string;
}) {
  const router = useRouter();
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    if (confirm !== ventureName) return;
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/ventures/${ventureId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const d = (await res.json()) as { error?: string };
      setError(d.error ?? "Failed to delete");
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="danger-zone">
      <p className="muted">
        Permanently delete this venture and its entire ledger. This cannot be
        undone.
      </p>
      <label className="field-label" htmlFor="confirm-name">
        Type <strong>{ventureName}</strong> to confirm
      </label>
      <input
        id="confirm-name"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        className="settings-input"
        autoComplete="off"
      />
      <button
        type="button"
        className="btn btn-danger"
        disabled={loading || confirm !== ventureName}
        onClick={() => void onDelete()}
      >
        {loading ? "Deleting…" : "Delete venture"}
      </button>
      {error ? <p className="settings-error">{error}</p> : null}
    </div>
  );
}
