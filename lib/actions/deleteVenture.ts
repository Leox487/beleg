"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { deleteOwnedVenture, formatDeleteError } from "@/lib/deleteVenture";

export async function deleteVentureAction(
  _prev: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const confirm = String(formData.get("confirm") ?? "");
  const id = String(formData.get("ventureId") ?? "").trim();
  if (confirm !== "Confirm") {
    return { error: "Type Confirm to delete" };
  }
  if (!id) {
    return { error: "Missing venture" };
  }

  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    await deleteOwnedVenture(id, userId);
  } catch (e) {
    console.error("Venture delete failed:", e);
    return { error: formatDeleteError(e) };
  }

  redirect("/dashboard");
}
