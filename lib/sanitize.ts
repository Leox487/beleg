import "server-only";

import { createRequire } from "module";

const require = createRequire(import.meta.url);

function stripTags(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

type Purify = {
  sanitize: (input: string, cfg: { ALLOWED_TAGS: string[] }) => string;
};

let purify: Purify | null | undefined;

function getPurify(): Purify | null {
  if (purify !== undefined) return purify;
  try {
    const { JSDOM } = require("jsdom") as typeof import("jsdom");
    const DOMPurify = require("dompurify") as (
      window: unknown,
    ) => Purify;
    const window = new JSDOM("").window;
    purify = DOMPurify(window);
    return purify;
  } catch (e) {
    console.error("sanitize: jsdom/DOMPurify unavailable, stripping tags", e);
    purify = null;
    return null;
  }
}

export function sanitizeText(input: string): string {
  const p = getPurify();
  if (!p) return stripTags(input);
  try {
    return p.sanitize(input, { ALLOWED_TAGS: [] }).trim();
  } catch {
    return stripTags(input);
  }
}
