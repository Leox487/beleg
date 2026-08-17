import "server-only";

import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

function fallbackFromEmail(input: {
  subject: string | null;
  text: string | null;
}): { title: string; body: string | null } {
  const subject = (input.subject ?? "").trim();
  const text = (input.text ?? "").trim();
  const title = subject.slice(0, 200) || "Email milestone";
  const body = text ? text.slice(0, 200) : null;
  return { title, body };
}

function parseMilestoneJson(
  raw: string,
  fallback: { title: string; body: string | null },
): { title: string; body: string | null } {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Claude response was not JSON");
  const parsed = JSON.parse(match[0]) as {
    title?: unknown;
    body?: unknown;
  };
  const title =
    typeof parsed.title === "string" && parsed.title.trim()
      ? parsed.title.trim().slice(0, 200)
      : fallback.title;
  const body =
    typeof parsed.body === "string" && parsed.body.trim()
      ? parsed.body.trim().slice(0, 500)
      : fallback.body;
  return { title, body };
}

/**
 * Extract a clean milestone title/body from an inbound email via Claude Haiku.
 * Invalid JSON, timeouts, or any model error fall back to the email subject
 * and the first 200 characters of the body so an entry is always created.
 */
export async function extractMilestoneFromEmail(input: {
  subject: string | null;
  text: string | null;
}): Promise<{ title: string; body: string | null }> {
  const fallback = fallbackFromEmail(input);

  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("ANTHROPIC_API_KEY unset; using subject/body fallback");
    return fallback;
  }

  try {
    const { text } = await generateText({
      model: anthropic("claude-haiku-4-5-20251001"),
      system:
        "You are processing a forwarded email to extract a business milestone. Return ONLY valid JSON with two fields: title (a specific, factual one-sentence milestone title under 80 characters, drawn from the email content) and body (optional additional detail, 1-2 sentences max, or null if nothing substantive to add). Do not invent facts. Do not add commentary.",
      prompt: `Subject: ${fallback.title}\n\nBody: ${(input.text ?? "").slice(0, 6000)}`,
      abortSignal: AbortSignal.timeout(12_000),
    });

    try {
      return parseMilestoneJson(text, fallback);
    } catch (error) {
      console.warn("Claude returned invalid JSON; using subject/body fallback:", error);
      return fallback;
    }
  } catch (error) {
    console.warn("Milestone extraction failed; using fallback:", error);
    return fallback;
  }
}
