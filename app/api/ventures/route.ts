import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { createVentureForUser } from "@/lib/createVenture";
import { formatDeleteError } from "@/lib/deleteVenture";
import { rateLimitOk, tooManyRequests } from "@/lib/rateLimit";

export const runtime = "nodejs";

type Body = Record<string, unknown>;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await rateLimitOk(`ventures-post:${userId}`, 10, 60 * 60 * 1000))) {
    return tooManyRequests(3600);
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name : "";
  const tagline = typeof body.tagline === "string" ? body.tagline : "";

  try {
    const venture = await createVentureForUser(userId, name, tagline);
    return NextResponse.json({ venture }, { status: 201 });
  } catch (e) {
    console.error("Venture insert error:", e);
    const message =
      e instanceof Error && e.message
        ? e.message
        : formatDeleteError(e);
    const status =
      message === "Name is required" ||
      message === "Name must be 80 characters or fewer"
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
