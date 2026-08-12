import "server-only";

import { appendEntry } from "@/lib/chain";

/**
 * Thin wrapper around appendEntry for email-ingested milestones.
 * Beleg stores milestones as hash-chained `entries`.
 */
export async function createMilestone(input: {
  ventureId: string;
  title: string;
  description: string;
  occurredAt?: string | null;
}) {
  return appendEntry({
    venture_id: input.ventureId,
    kind: "milestone",
    title: input.title.slice(0, 200),
    body: input.description,
    occurred_at: input.occurredAt ?? null,
  });
}
