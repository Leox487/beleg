"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { CopyText } from "@/app/components/CopyText";

interface SentState {
  to: string;
  emailed: boolean;
  confirmUrl: string;
}

export function RequestAttestForm({ entryId }: { entryId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [statement, setStatement] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<SentState | null>(null);

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
      const data = (await res.json()) as {
        url?: string;
        confirm_url?: string;
        emailed?: boolean;
        error?: string;
      };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not create request.");
        return;
      }
      setSent({
        to: email.trim(),
        emailed: Boolean(data.emailed),
        confirmUrl: data.confirm_url ?? data.url,
      });
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

  if (sent) {
    return (
      <div className="attest-sent">
        {sent.emailed ? (
          <>
            <p className="attest-sent-head">
              <span className="attest-sent-check" aria-hidden="true">
                ✓
              </span>
              Invitation sent to {sent.to}
            </p>
            <p className="attest-sent-note">
              They can confirm in one click — no account needed. You&apos;ll see
              their confirmation appear in the chain once they do.
            </p>
          </>
        ) : (
          <>
            <p className="attest-sent-head attest-sent-warn">
              Request created, but the email didn&apos;t send.
            </p>
            <p className="attest-sent-note">
              Send {sent.to} this link yourself — it works exactly the same.
            </p>
            <CopyText value={sent.confirmUrl} />
          </>
        )}
        <button
          type="button"
          className="btn btn-ghost btn-small"
          onClick={() => {
            setSent(null);
            setOpen(false);
          }}
        >
          Done
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        className="btn btn-secondary btn-small"
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
        <p className="field-help">
          We&apos;ll email them a one-click confirmation link. No account needed
          on their end.
        </p>
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
        <p className="field-help">
          Write what you want them to confirm. Example: &ldquo;I confirmed the
          wrist prototype&apos;s hydration sensor worked correctly on July 16,
          2026.&rdquo; Keep it factual and specific.
        </p>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="form-actions">
        <button
          type="submit"
          className={`btn btn-primary${submitting ? " btn-loading" : ""}`}
          disabled={submitting}
        >
          {submitting ? (
            <span className="btn-ellipsis">…</span>
          ) : (
            "Send invitation"
          )}
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
