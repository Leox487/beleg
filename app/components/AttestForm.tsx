"use client";

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type Tab = "confirm" | "other";

// Absent in local development; the widget is then skipped and the route falls
// back to its rate limit.
const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function AttestForm({
  token,
  initialName,
}: {
  token: string;
  initialName: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("confirm");
  const [name, setName] = useState(initialName);
  const [note, setNote] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(undefined);

  // Turnstile tokens are single-use, so a rejected submit needs a fresh one.
  const resetTurnstile = () => {
    if (!siteKey) return;
    setTurnstileToken(null);
    turnstileRef.current?.reset();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (siteKey && !turnstileToken) {
      setError("Please wait for the verification check to finish.");
      return;
    }

    if (!confirmed) {
      setError("Please check the confirmation box.");
      setTab("confirm");
      return;
    }

    const trimmedNote = note.trim();
    if (trimmedNote.length > 2000) {
      setError("Details must be 2,000 characters or fewer.");
      setTab("other");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/attestations/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          attester_name: name.trim(),
          attester_note: trimmedNote || undefined,
          turnstile_token: turnstileToken ?? undefined,
        }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        setError(data.error ?? "Could not confirm. Please try again.");
        resetTurnstile();
        return;
      }
      setDone(true);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      resetTurnstile();
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="attest-done verify-ok">
        ✓ Thank you. Your confirmation has been recorded.
      </div>
    );
  }

  return (
    <form className="venture-form attest-form" onSubmit={onSubmit}>
      <div className="attest-tabs" role="tablist" aria-label="Confirmation steps">
        <button
          type="button"
          role="tab"
          id="attest-tab-confirm"
          aria-selected={tab === "confirm"}
          aria-controls="attest-panel-confirm"
          className={`attest-tab${tab === "confirm" ? " is-active" : ""}`}
          onClick={() => setTab("confirm")}
        >
          Confirm
        </button>
        <button
          type="button"
          role="tab"
          id="attest-tab-other"
          aria-selected={tab === "other"}
          aria-controls="attest-panel-other"
          className={`attest-tab${tab === "other" ? " is-active" : ""}`}
          onClick={() => setTab("other")}
        >
          Other
          {note.trim() ? <span className="attest-tab-dot" aria-hidden="true" /> : null}
        </button>
      </div>

      {tab === "confirm" ? (
        <div
          className="attest-tab-panel"
          role="tabpanel"
          id="attest-panel-confirm"
          aria-labelledby="attest-tab-confirm"
        >
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

          <p className="field-help">
            Switch to Other if you want to add facts or context about what
            actually happened. Those details are sealed into the same record.
          </p>
        </div>
      ) : (
        <div
          className="attest-tab-panel"
          role="tabpanel"
          id="attest-panel-other"
          aria-labelledby="attest-tab-other"
        >
          <div className="field-group">
            <label className="field-label" htmlFor="attester-note">
              Your details
            </label>
            <textarea
              id="attester-note"
              className="text-input textarea"
              rows={6}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What did you actually see or know? Dates, amounts, roles, outcomes: anything a reviewer should be able to check against your word."
              maxLength={2000}
            />
            <p className="field-help">
              Optional, but useful. This becomes part of the public sealed
              record with your name. {note.trim().length}/2000
            </p>
          </div>
        </div>
      )}

      {siteKey ? (
        <div className="attest-turnstile">
          <Turnstile
            ref={turnstileRef}
            siteKey={siteKey}
            onSuccess={setTurnstileToken}
            onExpire={() => setTurnstileToken(null)}
            onError={() => {
              setTurnstileToken(null);
              setError("Verification could not load. Please reload the page.");
            }}
          />
        </div>
      ) : null}

      {error ? <p className="form-error">{error}</p> : null}

      <button
        type="submit"
        className={`btn btn-primary btn-block${submitting ? " btn-loading" : ""}`}
        disabled={submitting || !confirmed || (Boolean(siteKey) && !turnstileToken)}
      >
        {submitting ? <span className="btn-ellipsis">…</span> : "Confirm"}
      </button>

      <p className="field-help">
        Your name and email will be publicly visible on their proof page. You can
        only confirm once. There is no account to create.
      </p>
    </form>
  );
}
