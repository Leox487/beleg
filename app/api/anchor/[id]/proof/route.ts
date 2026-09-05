import { proofBase64ToBytes } from "@/lib/ots";
import { clientIp, rateLimitOk, tooManyRequests } from "@/lib/rateLimit";
import sql from "@/lib/supabase";

// Serves raw .ots proof bytes. Node runtime for Buffer handling.
export const runtime = "nodejs";

// PUBLIC: anyone can download a ledger's .ots proof and verify it independently
// with the standard `ots verify` CLI, without trusting Beleg at all.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await rateLimitOk(`anchor-proof:${clientIp(req)}`, 60, 60 * 1000))) {
    return tooManyRequests(60);
  }

  const { id } = await params;

  const anchorRows = await sql`
    SELECT id, anchored_seq, ots_proof, venture_id
    FROM anchors
    WHERE id = ${id}
    LIMIT 1
  `;
  const anchor = anchorRows[0] as
    | {
        id: string;
        anchored_seq: number;
        ots_proof: string;
        venture_id: string;
      }
    | undefined;

  if (!anchor) {
    return new Response("Anchor not found", { status: 404 });
  }

  const ventureRows = await sql`
    SELECT slug FROM ventures
    WHERE id = ${anchor.venture_id}
    LIMIT 1
  `;
  const venture = ventureRows[0] as { slug: string } | undefined;

  const slug = venture?.slug ?? "ledger";
  const filename = `beleg-${slug}-seq${anchor.anchored_seq}.ots`;

  const bytes = proofBase64ToBytes(anchor.ots_proof);
  const arrayBuffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;

  return new Response(arrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(bytes.byteLength),
    },
  });
}
