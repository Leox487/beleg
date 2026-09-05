import "server-only";

import { mapVenture } from "@/lib/row";
import sql from "@/lib/supabase";

export function formatDeleteError(e: unknown): string {
  if (!e || typeof e !== "object") return "Failed to delete venture";
  const o = e as Record<string, unknown>;
  const parts = [o.message, o.detail, o.constraint, o.code].filter(
    (x): x is string => typeof x === "string" && x.length > 0,
  );
  return parts.join(" — ") || "Failed to delete venture";
}

export async function deleteOwnedVenture(
  id: string,
  userId: string,
): Promise<void> {
  const rows = await sql`
    SELECT id, clerk_user_id, name, slug, tagline, created_at
    FROM ventures
    WHERE id = ${id} AND clerk_user_id = ${userId}
    LIMIT 1
  `;
  const venture = rows[0]
    ? mapVenture(rows[0] as Record<string, unknown>)
    : null;
  if (!venture) {
    throw new Error("Venture not found");
  }

  await sql`DELETE FROM email_whitelist WHERE venture_id = ${id}`;
  await sql`
    UPDATE ingested_emails
    SET milestone_id = NULL
    WHERE endpoint_id IN (
      SELECT id FROM inbound_endpoints WHERE venture_id = ${id}
    )
  `;
  await sql`
    DELETE FROM ingested_emails
    WHERE endpoint_id IN (
      SELECT id FROM inbound_endpoints WHERE venture_id = ${id}
    )
  `;
  await sql`DELETE FROM inbound_endpoints WHERE venture_id = ${id}`;
  await sql`DELETE FROM stripe_connections WHERE venture_id = ${id}`;
  await sql`DELETE FROM attestations WHERE venture_id = ${id}`;
  await sql`DELETE FROM entries WHERE venture_id = ${id}`;
  await sql`DELETE FROM anchors WHERE venture_id = ${id}`;
  const removed = await sql`
    DELETE FROM ventures
    WHERE id = ${id} AND clerk_user_id = ${userId}
    RETURNING id
  `;
  if (!removed[0]) {
    throw new Error("Venture row was not deleted");
  }
}
