"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AttestForm({
  token,
  initialName,
}: {
  token: string;
  initialName: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!confirmed) {
      setError("Please check the confirmation box.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/attestations/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, attester_name: name.trim() }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        setError(data.error ?? "Could not confirm. Please try again.");
        return;
      }
      setDone(true);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="attest-done verify-ok">
        ✓ Thank you — your confirmation has been recorded.
      </div>
    );
  }

  return (
    <form className="venture-form" onSubmit={onSubmit}>
      <div className="field-group">
        <label className="field-label" htmlFor="attester-name">
          Your name
        </label>
        <input
          id="attester-name"
          type="text"
          className="text-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="How you'd like to be credited"
        />
      </div>

      <label className="check-inline">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
        />
        <span>I confirm this is accurate to the best of my knowledge.</span>
      </label>

      {error ? <p className="form-error">{error}</p> : null}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={submitting || !confirmed}
      >
        {submitting ? "Confirming…" : "Confirm"}
      </button>
    </form>
  );
}
