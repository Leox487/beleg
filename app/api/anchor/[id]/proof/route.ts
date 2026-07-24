import { createSupabaseServiceRoleClient } from "@/lib/supabase";
import { proofBase64ToBytes } from "@/lib/ots";

// Serves raw .ots proof bytes. Node runtime for Buffer handling.
export const runtime = "nodejs";

// PUBLIC: anyone can download a ledger's .ots proof and verify it independently
// with the standard `ots verify` CLI, without trusting Beleg at all.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const supabase = createSupabaseServiceRoleClient();

  const { data: anchor, error } = await supabase
    .from("anchors")
    .select("id, anchored_seq, ots_proof, venture_id")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Anchor lookup error:", error);
    return new Response("Failed to load anchor", { status: 500 });
  }
  if (!anchor) {
    return new Response("Anchor not found", { status: 404 });
  }

  const { data: venture } = await supabase
    .from("ventures")
    .select("slug")
    .eq("id", anchor.venture_id)
    .maybeSingle();

  const slug = venture?.slug ?? "ledger";
  const filename = `beleg-${slug}-seq${anchor.anchored_seq}.ots`;

  const bytes = proofBase64ToBytes(anchor.ots_proof as string);
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
