import type { NextRequest } from "next/server";

import { clientIp, rateLimitOk, tooManyRequests } from "@/lib/rateLimit";

// In-memory cache of hex-encoded block headers by height.
const headerCache = new Map<number, string>();

// Bounds the cache on a long-lived instance. Headers are ~160 chars each.
const CACHE_MAX = 2000;

// Anything past this is not a block anyone can be verifying against, and
// serving it would just be a free proxy to Blockstream on our egress IPs.
const MAX_PLAUSIBLE_HEIGHT = 2_000_000;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ height: string }> },
) {
  const { height: raw } = await params;

  // Reject junk before it can turn into two outbound fetches.
  if (!/^\d{1,7}$/.test(raw)) {
    return new Response("Invalid height", { status: 400 });
  }
  const height = parseInt(raw, 10);
  if (Number.isNaN(height) || height < 0 || height > MAX_PLAUSIBLE_HEIGHT) {
    return new Response("Invalid height", { status: 400 });
  }

  const cached = headerCache.get(height);
  if (cached) {
    return new Response(cached, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        // Headers are immutable once a block is buried.
        "Cache-Control": "public, max-age=3600, s-maxage=31536000, immutable",
      },
    });
  }

  // Only meter the misses. A cache hit costs nothing worth protecting, and
  // the height is caller-chosen so misses are the abusable path.
  if (!(await rateLimitOk(`block-header:${clientIp(req)}`, 30, 60 * 1000))) {
    return tooManyRequests(60);
  }

  const hashRes = await fetch(
    `https://blockstream.info/api/block-height/${height}`,
    { next: { revalidate: 86400 } },
  );
  if (!hashRes.ok) {
    return new Response("Block not found", { status: 404 });
  }
  const blockHash = (await hashRes.text()).trim();

  const headerRes = await fetch(
    `https://blockstream.info/api/block/${blockHash}/header`,
    { next: { revalidate: 86400 } },
  );
  if (!headerRes.ok) {
    return new Response("Header not found", { status: 404 });
  }
  const headerHex = (await headerRes.text()).trim();

  if (headerCache.size >= CACHE_MAX) headerCache.clear();
  headerCache.set(height, headerHex);

  return new Response(headerHex, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=31536000, immutable",
    },
  });
}
