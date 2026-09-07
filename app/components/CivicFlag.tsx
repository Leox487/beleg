"use client";

import { useState } from "react";

export function CivicFlag({
  changeId,
  city,
}: {
  changeId: string;
  city: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    try {
      const res = await fetch("/api/civic/flag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          change_id: changeId,
          reporter_name: name,
          reporter_email: email,
          note,
          city,
        }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setMessage(body.error ?? "Could not send the flag.");
        return;
      }
      setStatus("ok");
      setMessage("Flagged for review.");
      setOpen(false);
      setName("");
      setEmail("");
      setNote("");
    } catch {
      setStatus("error");
      setMessage("Could not send the flag.");
    }
  }

  return (
    <div className="civic-flag">
      <button type="button" className="civic-flag-btn" onClick={() => setOpen(true)}>
        Flag for review
      </button>
      {status !== "idle" && !open ? (
        <p className="civic-empty">{message}</p>
      ) : null}
      {open ? (
        <div className="civic-modal" role="dialog" aria-labelledby={`flag-${changeId}`}>
          <form className="civic-modal-card" onSubmit={onSubmit}>
            <h3 id={`flag-${changeId}`}>Flag this change</h3>
            <label>
              Name
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <label>
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label>
              Why this change matters
              <textarea
                required
                rows={4}
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </label>
            {status === "error" ? (
              <p className="civic-verify-empty">{message}</p>
            ) : null}
            <div className="civic-subscribe-row">
              <button type="submit" className="civic-btn">
                Send flag
              </button>
              <button
                type="button"
                className="civic-btn civic-btn-ghost"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
