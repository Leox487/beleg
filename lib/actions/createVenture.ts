"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { createVentureForUser } from "@/lib/createVenture";
import { formatDeleteError } from "@/lib/deleteVenture";
import { rateLimitOk } from "@/lib/rateLimit";

export async function createVentureAction(
  _prev: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const name = String(formData.get("name") ?? "");
  const tagline = String(formData.get("tagline") ?? "");

  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  if (!rateLimitOk(`ventures-post:${userId}`, 10, 60 * 60 * 1000)) {
    return { error: "Too many requests. Try again in an hour." };
  }

  let venture;
  try {
    venture = await createVentureForUser(userId, name, tagline);
  } catch (e) {
    console.error("Venture create failed:", e);
    if (e instanceof Error && e.message) {
      return { error: e.message };
    }
    return { error: formatDeleteError(e) };
  }

  redirect(`/v/${venture.id}`);
}
