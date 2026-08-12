import type { NextRequest } from "next/server";

// In-memory cache of hex-encoded block headers by height.
const headerCache = new Map<number, string>();

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ height: string }> },
) {
  const { height: raw } = await params;
  const height = parseInt(raw, 10);
  if (Number.isNaN(height) || height < 0) {
    return new Response("Invalid height", { status: 400 });
  }

  const cached = headerCache.get(height);
  if (cached) {
    return new Response(cached, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
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

  headerCache.set(height, headerHex);
  return new Response(headerHex, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
