import "server-only";

import { NextResponse } from "next/server";

import sql from "@/lib/supabase";

/**
 * Two-layer fixed-window limiter.
 *
 * L1 is a per-instance counter. It cannot enforce a global limit on its own
 * (Vercel runs many instances, each with its own memory), but it rejects
 * repeat offenders that land on a warm instance without spending a round
 * trip, which keeps the cost of being attacked low.
 *
 * L2 is the `rate_limits` table, which is shared across every instance and is
 * what actually enforces the limit.
 */
type LocalBucket = { bucket: number; hits: number };

const local = new Map<string, LocalBucket>();

/** Bounds L1 memory. Evicting early only costs us a round trip to L2. */
const LOCAL_MAX_KEYS = 5000;

function bumpLocal(key: string, bucket: number): number {
  const existing = local.get(key);
  if (!existing || existing.bucket !== bucket) {
    if (local.size >= LOCAL_MAX_KEYS) local.clear();
    local.set(key, { bucket, hits: 1 });
    return 1;
  }
  existing.hits += 1;
  return existing.hits;
}

export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip")?.trim();
  if (real) return real;
  return "unknown";
}

export async function rateLimitOk(
  key: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  const bucket = Math.floor(Date.now() / windowMs) * windowMs;

  if (bumpLocal(key, bucket) > limit) return false;

  const windowStart = new Date(bucket);
  try {
    const rows = await sql`
      INSERT INTO rate_limits (key, window_start, hits)
      VALUES (${key}, ${windowStart}, 1)
      ON CONFLICT (key) DO UPDATE SET
        hits = CASE
          WHEN rate_limits.window_start = ${windowStart}
            THEN rate_limits.hits + 1
          ELSE 1
        END,
        window_start = ${windowStart}
      RETURNING hits
    `;
    return Number(rows[0]?.hits ?? 0) <= limit;
  } catch (error) {
    // The counter table is unreachable. L1 already allowed this request, so
    // fall back to it rather than taking the whole route down.
    console.error("Rate limit store unavailable; using per-instance count:", error);
    return true;
  }
}

/** Drops spent windows. Called from the nightly cron. */
export async function pruneRateLimits(): Promise<number> {
  const rows = await sql`
    DELETE FROM rate_limits
    WHERE window_start < now() - interval '1 day'
    RETURNING key
  `;
  return rows.length;
}

export function tooManyRequests(retryAfterSeconds: number): NextResponse {
  return NextResponse.json(
    { error: "Too many requests" },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSeconds) },
    },
  );
}
