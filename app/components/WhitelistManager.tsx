"use client";

import { useCallback, useEffect, useState } from "react";

export default function WhitelistManager({
  ventureId,
}: {
  ventureId: string;
}) {
  const [emails, setEmails] = useState<{ id: string; sender_email: string }[]>(
    [],
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWhitelist = useCallback(async () => {
    const res = await fetch(`/api/whitelist?ventureId=${ventureId}`);
    const data = (await res.json()) as {
      emails?: { id: string; sender_email: string }[];
    };
    setEmails(data.emails ?? []);
  }, [ventureId]);

  useEffect(() => {
    void fetchWhitelist();
  }, [fetchWhitelist]);

  async function addEmail() {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    const res = await fetch("/api/whitelist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ventureId,
        senderEmail: input.trim().toLowerCase(),
      }),
    });
    if (res.ok) {
      setInput("");
      await fetchWhitelist();
    } else {
      const d = (await res.json()) as { error?: string };
      setError(d.error ?? "Failed to add");
    }
    setLoading(false);
  }

  async function removeEmail(id: string) {
    await fetch(`/api/whitelist/${id}`, { method: "DELETE" });
    await fetchWhitelist();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ fontSize: 13, color: "var(--text-2)", margin: 0 }}>
        Only emails from these addresses will auto-create entries when forwarded
        to your venture address.
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="email"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void addEmail()}
          placeholder="sender@example.com"
          style={{
            flex: 1,
            padding: "10px 14px",
            background: "var(--bg-raised-2)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--text)",
            fontSize: 14,
          }}
        />
        <button
          type="button"
          onClick={() => void addEmail()}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? "Adding…" : "Add"}
        </button>
      </div>
      {error ? (
        <p style={{ fontSize: 13, color: "var(--danger)", margin: 0 }}>
          {error}
        </p>
      ) : null}
      {emails.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>
          No whitelisted senders yet.
        </p>
      ) : null}
      {emails.map((e) => (
        <div
          key={e.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 14px",
            background: "var(--bg-raised)",
            border: "1px solid var(--border)",
            borderRadius: 8,
          }}
        >
          <span
            style={{
              fontSize: 14,
              color: "var(--text)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {e.sender_email}
          </span>
          <button
            type="button"
            onClick={() => void removeEmail(e.id)}
            className="btn btn-ghost"
            style={{ color: "var(--danger)", fontSize: 13 }}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
