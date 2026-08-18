import "server-only";

import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";

const window = new JSDOM("").window;
const purify = DOMPurify(window as any);

export function sanitizeText(input: string): string {
  return purify.sanitize(input, { ALLOWED_TAGS: [] }).trim();
}
