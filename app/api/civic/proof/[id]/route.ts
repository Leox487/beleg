import { proofBase64ToBytes } from "@/lib/ots";
import { clientIp, rateLimitOk, tooManyRequests } from "@/lib/rateLimit";
import sql from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await rateLimitOk(`civic-proof:${clientIp(req)}`, 60, 60 * 1000))) {
    return tooManyRequests(60);
  }

  const { id } = await params;
  const rows = await sql`
    SELECT id, dataset_id, ots_proof
    FROM civic_records
    WHERE id = ${id}
    LIMIT 1
  `;
  const record = rows[0] as Record<string, unknown> | undefined;

  const proof = record?.ots_proof == null ? null : String(record.ots_proof);
  if (!record || !proof) {
    return new Response("Proof not found", { status: 404 });
  }

  const bytes = proofBase64ToBytes(proof);
  const filename = `beleg-civic-${String(record.dataset_id)}-${String(record.id).slice(0, 8)}.ots`;
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
