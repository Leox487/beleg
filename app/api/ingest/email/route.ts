import "server-only";

export async function POST(_request: Request) {
  // TODO: Parse incoming email, verify DKIM, create milestone
  // For now, just return 200 to acknowledge receipt
  return new Response("OK", { status: 200 });
}
