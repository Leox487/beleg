import { NextResponse } from "next/server";

import { findCityBySlug } from "@/lib/civic-cities";
import { discoverCityRecords } from "@/lib/civic-discovery";

export const runtime = "nodejs";
export const maxDuration = 300;

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

async function handleDiscover(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const city = new URL(req.url).searchParams.get("city")?.trim() ?? "";
  if (!city || !findCityBySlug(city)) {
    return NextResponse.json({ error: "Unknown city" }, { status: 400 });
  }

  const result = await discoverCityRecords(city);
  return NextResponse.json({ ...result, city });
}

export async function GET(req: Request) {
  return handleDiscover(req);
}

export async function POST(req: Request) {
  return handleDiscover(req);
}
