import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import sql from "@/lib/supabase";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const rows = await sql`
    SELECT w.id, w.venture_id
    FROM email_whitelist w
    JOIN ventures v ON v.id = w.venture_id
    WHERE w.id = ${id} AND v.clerk_user_id = ${userId}
    LIMIT 1
  `;

  if (!rows[0]) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await sql`DELETE FROM email_whitelist WHERE id = ${id}`;
  return NextResponse.json({ deleted: true });
}
