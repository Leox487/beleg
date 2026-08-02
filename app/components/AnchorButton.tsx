"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AnchorButton({ ventureId }: { ventureId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/anchor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venture_id: ventureId }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not anchor this ledger.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="anchor-action">
      <button
        type="button"
        className={`btn btn-primary${submitting ? " btn-loading" : ""}`}
        onClick={onClick}
        disabled={submitting}
      >
        {submitting ? (
          <span className="btn-ellipsis">…</span>
        ) : (
          "Anchor this ledger to Bitcoin"
        )}
      </button>
      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
}
