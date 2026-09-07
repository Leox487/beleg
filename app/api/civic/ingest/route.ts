import { NextResponse } from "next/server";

import { findCityBySlug } from "@/lib/civic-cities";
import { scrapeCivicRecords } from "@/lib/civic-scraper";
import sql from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 90;

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

async function handleIngest(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const city = new URL(req.url).searchParams.get("city")?.trim() || undefined;
  if (city && !findCityBySlug(city)) {
    return NextResponse.json({ error: "Unknown city" }, { status: 400 });
  }

  const started = Date.now();
  const result = await scrapeCivicRecords(city);
  const durationMs = Date.now() - started;
  const cityLabel = city ?? "all";

  const logRows = await sql`
    INSERT INTO civic_ingest_log (
      city, checked, changed, new_records, errors, duration_ms
    ) VALUES (
      ${cityLabel}, ${result.checked}, ${result.changed}, ${result.new_records},
      ${sql.json(result.errors)}, ${durationMs}
    )
    RETURNING id
  `;
  const logId = String((logRows[0] as Record<string, unknown> | undefined)?.id ?? "");

  return NextResponse.json({
    ...result,
    city: cityLabel,
    log_id: logId,
  });
}

export async function GET(req: Request) {
  return handleIngest(req);
}

export async function POST(req: Request) {
  return handleIngest(req);
}
