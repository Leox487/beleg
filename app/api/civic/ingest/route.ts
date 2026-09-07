import { NextResponse } from "next/server";

import { scrapeCivicRecords } from "@/lib/civic-scraper";

export const runtime = "nodejs";
export const maxDuration = 300;

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

async function handleIngest(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await scrapeCivicRecords();
  return NextResponse.json(result);
}

// Vercel Cron sends GET with Authorization: Bearer $CRON_SECRET.
export async function GET(req: Request) {
  return handleIngest(req);
}

export async function POST(req: Request) {
  return handleIngest(req);
}
