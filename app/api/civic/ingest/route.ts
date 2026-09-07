import { NextResponse } from "next/server";

import { findCityBySlug } from "@/lib/civic-cities";
import { scrapeCivicRecords } from "@/lib/civic-scraper";

export const runtime = "nodejs";
export const maxDuration = 60;

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

  const result = await scrapeCivicRecords(city);
  return NextResponse.json({
    ...result,
    city: city ?? "all",
  });
}

// Vercel Cron sends GET with Authorization: Bearer $CRON_SECRET.
export async function GET(req: Request) {
  return handleIngest(req);
}

export async function POST(req: Request) {
  return handleIngest(req);
}
