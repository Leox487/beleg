"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewVentureForm({ collapsible = false }: { collapsible?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(!collapsible);
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name is required.");
      return;
    }
    if (trimmed.length > 80) {
      setError("Name must be 80 characters or fewer.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/ventures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, tagline: tagline.trim() }),
      });
      const data = (await res.json()) as {
        venture?: { id: string };
        error?: string;
      };
      if (!res.ok || !data.venture) {
        setError(data.error ?? "Could not create venture.");
        return;
      }
      router.push(`/v/${data.venture.id}`);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (collapsible && !open) {
    return (
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => setOpen(true)}
      >
        New venture
      </button>
    );
  }

  return (
    <form className="venture-form" onSubmit={onSubmit}>
      <div className="field-group">
        <label className="field-label" htmlFor="venture-name">
          Name
        </label>
        <input
          id="venture-name"
          type="text"
          className="text-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          placeholder="e.g. BioBand"
          required
          autoFocus={collapsible}
        />
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor="venture-tagline">
          Tagline <span className="muted">(optional)</span>
        </label>
        <input
          id="venture-tagline"
          type="text"
          className="text-input"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder="One line on what it is"
        />
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Creating…" : "Create venture"}
        </button>
        {collapsible ? (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setOpen(false)}
            disabled={submitting}
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
