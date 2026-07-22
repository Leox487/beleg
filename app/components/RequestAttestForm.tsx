"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RequestAttestForm({ entryId }: { entryId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [statement, setStatement] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!email.trim()) {
      setError("Attester email is required.");
      return;
    }
    if (!statement.trim()) {
      setError("A statement is required.");
      return;
    }
    if (statement.trim().length > 280) {
      setError("Statement must be 280 characters or fewer.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/attestations/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entry_id: entryId,
          attester_email: email.trim(),
          attester_name: name.trim(),
          statement: statement.trim(),
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not create request.");
        return;
      }
      setOpen(false);
      setEmail("");
      setName("");
      setStatement("");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        className="btn btn-ghost btn-small"
        onClick={() => setOpen(true)}
      >
        Request attestation
      </button>
    );
  }

  return (
    <form className="request-attest-form" onSubmit={onSubmit}>
      <div className="field-group">
        <label className="field-label" htmlFor={`att-email-${entryId}`}>
          Attester email
        </label>
        <input
          id={`att-email-${entryId}`}
          type="email"
          className="text-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="who@example.com"
          required
        />
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor={`att-name-${entryId}`}>
          Attester name <span className="muted">(optional)</span>
        </label>
        <input
          id={`att-name-${entryId}`}
          type="text"
          className="text-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor={`att-stmt-${entryId}`}>
          What should they confirm?
        </label>
        <textarea
          id={`att-stmt-${entryId}`}
          className="text-input textarea"
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          rows={2}
          maxLength={280}
          placeholder="e.g. I was the design partner on this launch and it shipped on this date."
          required
        />
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Creating…" : "Create request"}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setOpen(false)}
          disabled={submitting}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
