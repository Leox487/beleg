import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

import sql from "@/lib/supabase";

/**
 * Layered limiter.
 *
 * L1 is a per-instance counter. It cannot enforce a global limit on its own
 * (Vercel runs many instances, each with its own memory), but it rejects
 * repeat offenders that land on a warm instance without spending a round
 * trip, which keeps the cost of being attacked low.
 *
 * L2 is the shared counter. Upstash Redis is used when it is configured; the
 * `rate_limits` table is the fallback so an unprovisioned deployment still
 * gets a real cross-instance limit instead of none.
 */
type LocalBucket = { bucket: number; hits: number };

const local = new Map<string, LocalBucket>();

/** Bounds L1 memory. Evicting early only costs us a round trip to L2. */
const LOCAL_MAX_KEYS = 5000;

/** Defaults for `checkRateLimit`. */
const DEFAULT_LIMIT = 10;
const DEFAULT_WINDOW_MS = 60 * 1000;

export type RateLimitResult = {
  success: boolean;
  limit: number;
  /** Requests left in the window. Best-effort; 0 when the store is unknown. */
  remaining: number;
  /** Unix milliseconds at which the window resets. */
  reset: number;
};

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

// `undefined` means "not resolved yet", `null` means "Upstash is not available".
let redisClient: Redis | null | undefined;

function getRedis(): Redis | null {
  if (redisClient !== undefined) return redisClient;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    redisClient = null;
    return null;
  }

  try {
    redisClient = new Redis({ url, token });
  } catch (error) {
    console.error("Upstash client unavailable; using the Postgres counter:", error);
    redisClient = null;
  }
  return redisClient;
}

// One limiter per (limit, window) pair. These routes run on the Node runtime,
// where the module is reused across requests, so building them per request
// would just churn allocations.
const limiters = new Map<string, Ratelimit>();

function getLimiter(limit: number, windowMs: number): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;

  const cacheKey = `${limit}:${windowMs}`;
  const cached = limiters.get(cacheKey);
  if (cached) return cached;

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
    prefix: "beleg:rl",
  });
  limiters.set(cacheKey, limiter);
  return limiter;
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

async function enforcePostgres(
  key: string,
  limit: number,
  windowMs: number,
  bucket: number,
): Promise<RateLimitResult> {
  const reset = bucket + windowMs;
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
    const hits = Number(rows[0]?.hits ?? 0);
    return {
      success: hits <= limit,
      limit,
      remaining: Math.max(0, limit - hits),
      reset,
    };
  } catch (error) {
    // The counter table is unreachable. L1 already allowed this request, so
    // fall back to it rather than taking the whole route down.
    console.error("Rate limit store unavailable; using per-instance count:", error);
    return { success: true, limit, remaining: 0, reset };
  }
}

async function enforce(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const bucket = Math.floor(Date.now() / windowMs) * windowMs;

  // Every L1 rejection is also over the shared limit, since a single instance
  // saw more than `limit` hits inside one window.
  if (bumpLocal(key, bucket) > limit) {
    return { success: false, limit, remaining: 0, reset: bucket + windowMs };
  }

  const limiter = getLimiter(limit, windowMs);
  if (limiter) {
    try {
      const result = await limiter.limit(key);
      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
      };
    } catch (error) {
      // Upstash is configured but unreachable or erroring. Drop to the table
      // rather than failing the request.
      console.error("Upstash rate limit failed; falling back to Postgres:", error);
    }
  }

  return enforcePostgres(key, limit, windowMs, bucket);
}

export async function rateLimitOk(
  key: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  return (await enforce(key, limit, windowMs)).success;
}

/**
 * Per-IP limit for a named action, at the default of 10 requests per minute.
 * Returns the counters so the caller can set `X-RateLimit-*` headers.
 */
export async function checkRateLimit(
  ip: string,
  actionPrefix: string,
): Promise<RateLimitResult> {
  return enforce(`${actionPrefix}:${ip}`, DEFAULT_LIMIT, DEFAULT_WINDOW_MS);
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
