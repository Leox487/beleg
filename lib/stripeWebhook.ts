import { createHmac, timingSafeEqual } from "crypto";

const MAX_AGE_SECONDS = 5 * 60;

/**
 * Verify a Stripe-Signature header against the raw request body.
 * Format: `t=<unix>,v1=<hex hmac>`
 */
export function verifyStripeSignature(
  rawBody: string,
  header: string | null,
  secret: string,
): { ok: true } | { ok: false; error: string } {
  if (!header) return { ok: false, error: "Missing stripe-signature header" };

  let timestamp = "";
  const signatures: string[] = [];
  for (const part of header.split(",")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    const key = part.slice(0, eq).trim();
    const value = part.slice(eq + 1).trim();
    if (key === "t") timestamp = value;
    if (key === "v1") signatures.push(value);
  }

  if (!timestamp || signatures.length === 0) {
    return { ok: false, error: "Malformed stripe-signature header" };
  }

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) {
    return { ok: false, error: "Invalid signature timestamp" };
  }
  const age = Math.abs(Date.now() / 1000 - ts);
  if (age > MAX_AGE_SECONDS) {
    return { ok: false, error: "Signature timestamp too old" };
  }

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");
  const expectedBuf = Buffer.from(expected, "hex");

  for (const sig of signatures) {
    try {
      const got = Buffer.from(sig, "hex");
      if (
        got.length === expectedBuf.length &&
        timingSafeEqual(got, expectedBuf)
      ) {
        return { ok: true };
      }
    } catch {
      // ignore malformed hex
    }
  }

  return { ok: false, error: "Invalid signature" };
}

export function unixToDateOnly(unixSeconds: number): string {
  const d = new Date(unixSeconds * 1000);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatStripeMoney(amount: number, currency: string): string {
  const major = (amount / 100).toFixed(2);
  return `$${major} ${currency.toUpperCase()}`;
}

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
