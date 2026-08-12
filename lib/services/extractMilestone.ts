import "server-only";

import { anthropic } from "@ai-sdk/anthropic";
import { generateText, Output } from "ai";
import { z } from "zod";

const MilestoneExtractSchema = z.object({
  title: z.string(),
  body: z.string().nullable(),
});

const SYSTEM_PROMPT =
  "You are processing a forwarded email to extract a business milestone. Return ONLY valid JSON with two fields: title (a specific, factual one-sentence milestone title under 80 characters, drawn from the email content) and body (optional additional detail, 1-2 sentences max, or null if nothing substantive to add). Do not invent facts. Do not add commentary.";

/**
 * Extract a clean milestone title/body from an inbound email via Claude Haiku.
 * Falls back to subject / truncated body if the model call fails.
 */
export async function extractMilestoneFromEmail(input: {
  subject: string | null;
  text: string | null;
}): Promise<{ title: string; body: string | null }> {
  const subject = (input.subject ?? "").trim();
  const text = (input.text ?? "").trim();
  const fallbackTitle =
    subject.slice(0, 80) ||
    text.split(/\r?\n/).find((l) => l.trim())?.trim().slice(0, 80) ||
    "Email milestone";
  const fallbackBody = text
    ? text.slice(0, 400) + (text.length > 400 ? "…" : "")
    : null;

  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("ANTHROPIC_API_KEY unset; using subject/body fallback");
    return { title: fallbackTitle, body: fallbackBody };
  }

  try {
    const { output } = await generateText({
      model: anthropic("claude-haiku-4-5-20251001"),
      system: SYSTEM_PROMPT,
      prompt: `Subject: ${subject}\n\nBody: ${text.slice(0, 6000)}`,
      output: Output.object({ schema: MilestoneExtractSchema }),
    });

    const title = (output?.title ?? "").trim().slice(0, 80) || fallbackTitle;
    const bodyRaw = output?.body;
    const body =
      typeof bodyRaw === "string" && bodyRaw.trim()
        ? bodyRaw.trim().slice(0, 500)
        : null;
    return { title, body };
  } catch (error) {
    console.warn("Milestone extraction failed; using fallback:", error);
    return { title: fallbackTitle, body: fallbackBody };
  }
}
