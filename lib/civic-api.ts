import { NextResponse } from "next/server";

export function civicCorsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export function civicJson(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: civicCorsHeaders(),
  });
}

export function civicOptions(): NextResponse {
  return new NextResponse(null, { status: 204, headers: civicCorsHeaders() });
}

export function civicTooMany(): NextResponse {
  return NextResponse.json(
    { error: "Too many requests" },
    {
      status: 429,
      headers: {
        ...civicCorsHeaders(),
        "Retry-After": "3600",
      },
    },
  );
}
