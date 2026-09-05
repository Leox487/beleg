import { randomUUID } from "crypto";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { encryptSecret } from "@/lib/crypto";
import sql from "@/lib/supabase";

function appOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://belegapp.com"
  );
}

function webhookUrl(ventureId: string): string {
  return `${appOrigin()}/api/stripe/webhook/${ventureId}`;
}

function generateWebhookSecret(): string {
  const raw = randomUUID().replace(/-/g, "");
  return raw.padEnd(32, "0").slice(0, 32);
}

async function ownedVenture(ventureId: string, userId: string) {
  const rows = await sql`
    SELECT id FROM ventures
    WHERE id = ${ventureId} AND clerk_user_id = ${userId}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

async function verifyStripeKey(secretKey: string): Promise<{
  ok: true;
  accountId: string;
} | { ok: false; error: string }> {
  const res = await fetch("https://api.stripe.com/v1/account", {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  if (!res.ok) {
    return { ok: false, error: "Stripe key is invalid or lacks account access" };
  }
  const account = (await res.json()) as { id?: string };
  if (!account.id) {
    return { ok: false, error: "Stripe account id missing" };
  }
  return { ok: true, accountId: account.id };
}

/** Best-effort: register the endpoint so Stripe's signing secret matches ours. */
async function registerStripeEndpoint(
  secretKey: string,
  url: string,
): Promise<string | null> {
  const body = new URLSearchParams();
  body.set("url", url);
  for (const event of [
    "payment_intent.succeeded",
    "charge.succeeded",
    "invoice.payment_succeeded",
    "customer.subscription.created",
    "customer.subscription.deleted",
  ]) {
    body.append("enabled_events[]", event);
  }

  const res = await fetch("https://api.stripe.com/v1/webhook_endpoints", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { secret?: string };
  return data.secret ?? null;
}

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ventureId = new URL(req.url).searchParams.get("ventureId")?.trim();
  if (!ventureId) {
    return NextResponse.json(
      { error: "ventureId is required" },
      { status: 400 },
    );
  }
  if (!(await ownedVenture(ventureId, userId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const rows = await sql`
    SELECT stripe_account_id
    FROM stripe_connections
    WHERE venture_id = ${ventureId}
    LIMIT 1
  `;
  if (!rows[0]) {
    return NextResponse.json({ connected: false });
  }
  return NextResponse.json({
    connected: true,
    accountId: String(rows[0].stripe_account_id),
    webhookUrl: webhookUrl(ventureId),
  });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const ventureId =
    typeof body.ventureId === "string" ? body.ventureId.trim() : "";
  const stripeSecretKey =
    typeof body.stripeSecretKey === "string"
      ? body.stripeSecretKey.trim()
      : "";

  if (!ventureId) {
    return NextResponse.json(
      { error: "ventureId is required" },
      { status: 400 },
    );
  }
  if (!stripeSecretKey.startsWith("sk_") && !stripeSecretKey.startsWith("rk_")) {
    return NextResponse.json(
      { error: "Expected a Stripe secret or restricted key" },
      { status: 400 },
    );
  }
  if (!(await ownedVenture(ventureId, userId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const verified = await verifyStripeKey(stripeSecretKey);
  if (!verified.ok) {
    return NextResponse.json({ error: verified.error }, { status: 400 });
  }

  const url = webhookUrl(ventureId);
  const generated = generateWebhookSecret();
  const stripeSecret = await registerStripeEndpoint(stripeSecretKey, url);
  const webhookSecret = stripeSecret ?? generated;
  const enc = encryptSecret(stripeSecretKey);

  await sql`
    INSERT INTO stripe_connections (
      venture_id, clerk_user_id, stripe_account_id,
      stripe_secret_key_enc, webhook_secret
    )
    VALUES (
      ${ventureId}, ${userId}, ${verified.accountId},
      ${enc}, ${webhookSecret}
    )
    ON CONFLICT (venture_id) DO UPDATE SET
      clerk_user_id = EXCLUDED.clerk_user_id,
      stripe_account_id = EXCLUDED.stripe_account_id,
      stripe_secret_key_enc = EXCLUDED.stripe_secret_key_enc,
      webhook_secret = EXCLUDED.webhook_secret
  `;

  return NextResponse.json({
    connected: true,
    accountId: verified.accountId,
    webhookUrl: url,
  });
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const ventureId =
    typeof body.ventureId === "string" ? body.ventureId.trim() : "";
  if (!ventureId) {
    return NextResponse.json(
      { error: "ventureId is required" },
      { status: 400 },
    );
  }
  if (!(await ownedVenture(ventureId, userId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await sql`
    DELETE FROM stripe_connections
    WHERE venture_id = ${ventureId} AND clerk_user_id = ${userId}
  `;
  return NextResponse.json({ deleted: true });
}
