"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function TaglineForm({
  ventureId,
  initialTagline,
}: {
  ventureId: string;
  initialTagline: string | null;
}) {
  const router = useRouter();
  const [tagline, setTagline] = useState(initialTagline ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    const res = await fetch(`/api/ventures/${ventureId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tagline: tagline.trim() || null }),
    });
    if (!res.ok) {
      const d = (await res.json()) as { error?: string };
      setError(d.error ?? "Failed to save");
      setSaving(false);
      return;
    }
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="settings-form">
      <label className="field-label" htmlFor="tagline">
        Tagline
      </label>
      <input
        id="tagline"
        value={tagline}
        onChange={(e) => setTagline(e.target.value)}
        maxLength={280}
        placeholder="One line about what this venture is"
        className="settings-input"
      />
      <div className="settings-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={saving}
        >
          {saving ? "Saving…" : "Save tagline"}
        </button>
        {saved ? <span className="muted">Saved</span> : null}
        {error ? <span className="settings-error">{error}</span> : null}
      </div>
    </form>
  );
}
