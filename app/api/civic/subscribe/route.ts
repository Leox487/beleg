import { civicJson, civicOptions, civicTooMany } from "@/lib/civic-api";
import { findCity } from "@/lib/civic-cities";
import { clientIp, rateLimitOk } from "@/lib/rateLimit";
import sql from "@/lib/supabase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function OPTIONS() {
  return civicOptions();
}

export async function POST(req: Request) {
  if (!(await rateLimitOk(`civic-sub:${clientIp(req)}`, 10, 60 * 60 * 1000))) {
    return civicTooMany();
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return civicJson({ error: "Invalid JSON" }, 400);
  }

  const rawCity = typeof body.city === "string" ? body.city.trim() : "";
  const seed = findCity(rawCity);
  const cityName = seed?.city ?? "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!cityName || !EMAIL_RE.test(email)) {
    return civicJson({ error: "A valid city and email are required" }, 400);
  }

  await sql`
    INSERT INTO civic_subscribers (city, email)
    VALUES (${cityName}, ${email})
    ON CONFLICT (city, email) DO NOTHING
  `;

  return civicJson({ ok: true });
}
