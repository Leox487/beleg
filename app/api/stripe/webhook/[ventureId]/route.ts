import { NextRequest, NextResponse } from "next/server";

import { appendEntry } from "@/lib/chain";
import sql from "@/lib/supabase";
import {
  asNumber,
  asRecord,
  asString,
  formatStripeMoney,
  unixToDateOnly,
  verifyStripeSignature,
} from "@/lib/stripeWebhook";

export const runtime = "nodejs";

type StripeEvent = {
  type?: string;
  created?: number;
  data?: { object?: Record<string, unknown> };
};

function planFromSubscription(obj: Record<string, unknown>): {
  amount: number;
  interval: string;
  nickname: string | null;
  planId: string;
} {
  const items = asRecord(obj.items);
  const data = Array.isArray(items.data) ? items.data : [];
  const first = asRecord(data[0]);
  const plan = asRecord(first.plan ?? first.price ?? obj.plan);
  const recurring = asRecord(plan.recurring);
  return {
    amount: asNumber(plan.amount ?? plan.unit_amount) ?? 0,
    interval: asString(plan.interval ?? recurring.interval) ?? "period",
    nickname: asString(plan.nickname ?? plan.name),
    planId: asString(plan.id) ?? "unknown",
  };
}

function entryFromEvent(
  event: StripeEvent,
): { kind: string; title: string; body: string } | null {
  const obj = asRecord(event.data?.object);
  const type = event.type ?? "";

  if (type === "payment_intent.succeeded") {
    const amount = asNumber(obj.amount) ?? 0;
    const currency = asString(obj.currency) ?? "usd";
    const charges = asRecord(obj.charges);
    const chargeList = Array.isArray(charges.data) ? charges.data : [];
    const firstCharge = asRecord(chargeList[0]);
    const billing = asRecord(firstCharge.billing_details);
    const email =
      asString(obj.receipt_email) ??
      asString(billing.email) ??
      "unknown";
    const id = asString(obj.id) ?? "unknown";
    return {
      kind: "revenue",
      title: `Payment received — ${formatStripeMoney(amount, currency)}`,
      body: `Customer: ${email}. Payment ID: ${id}.`,
    };
  }

  if (type === "charge.succeeded") {
    const amount = asNumber(obj.amount) ?? 0;
    const currency = asString(obj.currency) ?? "usd";
    const billing = asRecord(obj.billing_details);
    const email =
      asString(obj.receipt_email) ?? asString(billing.email) ?? "unknown";
    const id = asString(obj.id) ?? "unknown";
    return {
      kind: "revenue",
      title: `Payment received — ${formatStripeMoney(amount, currency)}`,
      body: `Customer: ${email}. Payment ID: ${id}.`,
    };
  }

  if (type === "invoice.payment_succeeded") {
    const amount = asNumber(obj.amount_paid) ?? 0;
    const currency = asString(obj.currency) ?? "usd";
    const email =
      asString(obj.customer_email) ?? asString(obj.customer) ?? "unknown";
    const id = asString(obj.id) ?? "unknown";
    return {
      kind: "revenue",
      title: `Invoice paid — ${formatStripeMoney(amount, currency)}`,
      body: `Invoice ${id}. Customer: ${email}.`,
    };
  }

  if (type === "customer.subscription.created") {
    const plan = planFromSubscription(obj);
    const customer = asString(obj.customer) ?? "unknown";
    return {
      kind: "revenue",
      title: `New subscription started — $${(plan.amount / 100).toFixed(2)}/${plan.interval}`,
      body: `Plan: ${plan.nickname ?? plan.planId}. Customer: ${customer}.`,
    };
  }

  if (type === "customer.subscription.deleted") {
    const plan = planFromSubscription(obj);
    const customer = asString(obj.customer) ?? "unknown";
    return {
      kind: "milestone",
      title: "Subscription cancelled",
      body: `Plan: ${plan.nickname ?? plan.planId}. Customer: ${customer}.`,
    };
  }

  return null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ventureId: string }> },
) {
  const { ventureId } = await params;
  const rawBody = await request.text();
  const header = request.headers.get("stripe-signature");

  const rows = await sql`
    SELECT webhook_secret
    FROM stripe_connections
    WHERE venture_id = ${ventureId}
    LIMIT 1
  `;
  const secret = rows[0]?.webhook_secret
    ? String(rows[0].webhook_secret)
    : null;

  if (!secret) {
    return NextResponse.json(
      { received: true, error: "No Stripe connection for this venture" },
      { status: 200 },
    );
  }

  const verified = verifyStripeSignature(rawBody, header, secret);
  if (!verified.ok) {
    return NextResponse.json({ error: verified.error }, { status: 400 });
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(rawBody) as StripeEvent;
  } catch {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const mapped = entryFromEvent(event);
  if (!mapped) {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const created =
    typeof event.created === "number" ? event.created : Date.now() / 1000;

  try {
    const entry = await appendEntry({
      venture_id: ventureId,
      kind: mapped.kind,
      title: mapped.title.slice(0, 200),
      body: mapped.body,
      occurred_at: unixToDateOnly(created),
      source: "stripe",
      dkim_verified: null,
    });
    return NextResponse.json({ received: true, entry_id: entry.id });
  } catch (error) {
    console.error("Stripe ingest append failed:", error);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
