"use client";

import { useState } from "react";

export function CivicSubscribe({ city }: { city: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("idle");
    try {
      const res = await fetch("/api/civic/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, email }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setMessage(body.error ?? "Could not subscribe.");
        return;
      }
      setStatus("ok");
      setMessage("You will get an email if this city’s files change.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Could not subscribe.");
    }
  }

  return (
    <form className="civic-subscribe" onSubmit={onSubmit}>
      <label className="civic-verify-label" htmlFor="civic-subscribe-email">
        Subscribe to changes
      </label>
      <div className="civic-subscribe-row">
        <input
          id="civic-subscribe-email"
          className="civic-verify-input"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
        />
        <button type="submit" className="civic-btn">
          Subscribe
        </button>
      </div>
      {status !== "idle" ? (
        <p className={status === "ok" ? "civic-empty" : "civic-verify-empty"}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
