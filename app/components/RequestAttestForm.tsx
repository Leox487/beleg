"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface SentState {
  to: string;
  name: string;
  emailSent: boolean;
  confirmUrl: string;
}

function CopyableLink({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="attest-copy-field">
      <code className="attest-copy-url mono">{value}</code>
      <button type="button" className="btn btn-secondary btn-small" onClick={copy}>
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
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

    const submittedEmail = email.trim();
    const submittedName = name.trim();

    try {
      const res = await fetch("/api/attestations/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entry_id: entryId,
          attester_email: submittedEmail,
          attester_name: submittedName,
          statement: statement.trim(),
        }),
      });
      const data = (await res.json()) as {
        url?: string;
        confirm_url?: string;
        emailSent?: boolean;
        error?: string;
      };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not create request.");
        return;
      }
      setSent({
        to: submittedEmail,
        name: submittedName,
        emailSent: Boolean(data.emailSent),
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
    const who = sent.name || sent.to;
    return (
      <div className="attest-sent">
        {sent.emailSent ? (
          <>
            <p className="attest-sent-head">
              <span className="attest-sent-check" aria-hidden="true">
                ✓
              </span>
              Email sent
            </p>
            <p className="attest-sent-note">
              Email sent to {who} at {sent.to}. They&apos;ll receive a one-click
              confirmation link. You can also copy the link below to send it
              yourself.
            </p>
          </>
        ) : (
          <>
            <p className="attest-sent-head attest-sent-warn">
              We couldn&apos;t send the email automatically
            </p>
            <p className="attest-sent-note">
              Copy the link below and send it to {who} yourself.
            </p>
          </>
        )}

        <CopyableLink value={sent.confirmUrl} />

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
        className="attest-ghost-link"
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
