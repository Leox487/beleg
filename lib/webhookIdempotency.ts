import "server-only";

import sql from "@/lib/supabase";

/**
 * Atomically claim a webhook event ID. Returns true on first delivery so
 * the caller should process; false if this ID was already handled.
 */
export async function claimWebhookEvent(id: string): Promise<boolean> {
  const key = id.trim();
  if (!key) return true;

  const rows = await sql`
    INSERT INTO processed_webhook_ids (id)
    VALUES (${key})
    ON CONFLICT (id) DO NOTHING
    RETURNING id
  `;
  return rows.length > 0;
}
