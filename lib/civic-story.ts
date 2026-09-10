import "server-only";

import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

import type { CivicDiffSummary } from "@/lib/civic-diff";

export async function generateChangeStory({
  city,
  state,
  datasetName,
  resourceUrl,
  detectedAt,
  diff,
}: {
  city: string;
  state: string;
  datasetName: string;
  resourceUrl: string;
  detectedAt: string;
  diff: CivicDiffSummary;
}): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) return "";
  if (!diff.notable_changes.length) return "";

  const prompt = `You are a data journalist writing a brief, factual news summary about a change detected in a government dataset.

IMPORTANT RULES:
- Never speculate about why the data changed
- Never imply wrongdoing or misconduct
- Only describe what factually changed based on the data provided
- Write in a neutral, journalistic tone
- Maximum 3 sentences
- Start with the city and dataset name
- Include specific numbers where available
- End with: "The change was detected by Beleg, an automated cryptographic monitoring system."

Dataset: ${datasetName}
City: ${city}, ${state}
URL: ${resourceUrl}
Detected: ${detectedAt}
Changes: ${JSON.stringify(diff.notable_changes)}
Rows added: ${diff.rows_added}
Rows removed: ${diff.rows_removed}
Rows modified: ${diff.rows_modified}
Total rows before: ${diff.total_rows_before}
Total rows after: ${diff.total_rows_after}
Sample added rows: ${JSON.stringify(diff.sample_added?.slice(0, 3))}

Write a 2-3 sentence factual summary of what changed:`;

  try {
    const { text } = await generateText({
      model: anthropic("claude-haiku-4-5-20251001"),
      prompt,
      maxOutputTokens: 200,
      abortSignal: AbortSignal.timeout(15_000),
    });
    return text.trim();
  } catch (error) {
    console.error("Civic story generation failed:", error);
    return "";
  }
}
