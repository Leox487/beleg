"use client";

import { useState } from "react";

import { CopyText } from "@/app/components/CopyText";
import { FormError } from "@/app/components/FormError";

type Connection = {
  accountId: string;
  webhookUrl: string;
};

export function StripeConnect({
  ventureId,
  initial,
}: {
  ventureId: string;
  initial: Connection | null;
}) {
  const [connection, setConnection] = useState<Connection | null>(initial);
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function connect() {
    if (!key.trim()) return;
    setLoading(true);
    setError(null);
    const res = await fetch("/api/stripe/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ventureId,
        stripeSecretKey: key.trim(),
      }),
    });
    const data = (await res.json()) as Connection & { error?: string };
    if (!res.ok) {
      setError(data.error ?? "Failed to connect Stripe");
      setLoading(false);
      return;
    }
    setKey("");
    setConnection({
      accountId: data.accountId,
      webhookUrl: data.webhookUrl,
    });
    setLoading(false);
  }

  async function disconnect() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/stripe/connect", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ventureId }),
    });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Failed to disconnect");
      setLoading(false);
      return;
    }
    setConnection(null);
    setLoading(false);
  }

  if (connection) {
    return (
      <div className="stripe-connect">
        <p className="stripe-connected">✓ Stripe connected</p>
        <p className="muted">
          Account <code>{connection.accountId}</code>
        </p>
        <p className="muted">
          Copy this URL and add it as a webhook endpoint in your Stripe
          Dashboard → Developers → Webhooks → Add endpoint. Select these
          events: payment_intent.succeeded, charge.succeeded,
          invoice.payment_succeeded, customer.subscription.created,
          customer.subscription.deleted.
        </p>
        <div className="ingest-address-row">
          <code className="ingest-address">{connection.webhookUrl}</code>
          <CopyText value={connection.webhookUrl} />
        </div>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={loading}
          onClick={() => void disconnect()}
        >
          {loading ? "Disconnecting…" : "Disconnect"}
        </button>
        <FormError className="settings-error">{error}</FormError>
      </div>
    );
  }

  return (
    <div className="stripe-connect">
      <p className="muted">
        Paste your Stripe restricted key. It needs read access to payment
        intents, charges, invoices, and subscriptions. It is stored encrypted
        and used only to verify your webhook.
      </p>
      <label className="field-label" htmlFor="stripe-key">
        Stripe Secret Key
      </label>
      <input
        id="stripe-key"
        type="password"
        autoComplete="off"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        placeholder="rk_live_… or sk_test_…"
        className="settings-input"
      />
      <button
        type="button"
        className="btn btn-primary"
        disabled={loading || !key.trim()}
        onClick={() => void connect()}
      >
        {loading ? "Connecting…" : "Connect Stripe"}
      </button>
      <FormError className="settings-error">{error}</FormError>
    </div>
  );
}
