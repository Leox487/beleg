"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ENTRY_KINDS, type EntryKind } from "@/lib/types";

export function NewEntryForm({ ventureId }: { ventureId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [occurredAt, setOccurredAt] = useState("");
  const [kind, setKind] = useState<EntryKind>("milestone");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const trimmed = title.trim();
    if (!trimmed) {
      setError("Title is required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venture_id: ventureId,
          title: trimmed,
          body: body.trim(),
          occurred_at: occurredAt,
          kind,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not record entry.");
        return;
      }
      setTitle("");
      setBody("");
      setOccurredAt("");
      setKind("milestone");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="entry-form" onSubmit={onSubmit}>
      <div className="field-group">
        <label className="field-label" htmlFor="entry-title">
          Title
        </label>
        <input
          id="entry-title"
          type="text"
          className="text-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What happened?"
          required
        />
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor="entry-body">
          Details <span className="muted">(optional)</span>
        </label>
        <textarea
          id="entry-body"
          className="text-input textarea"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
        />
      </div>

      <div className="field-row">
        <div className="field-group">
          <label className="field-label" htmlFor="entry-occurred">
            Occurred on <span className="muted">(optional)</span>
          </label>
          <input
            id="entry-occurred"
            type="date"
            className="text-input"
            value={occurredAt}
            onChange={(e) => setOccurredAt(e.target.value)}
          />
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="entry-kind">
            Kind
          </label>
          <select
            id="entry-kind"
            className="text-input"
            value={kind}
            onChange={(e) => setKind(e.target.value as EntryKind)}
          >
            {ENTRY_KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? "Recording…" : "Record entry"}
      </button>
    </form>
  );
}
