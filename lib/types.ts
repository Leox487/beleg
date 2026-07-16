export interface Venture {
  id: string;
  clerk_user_id: string;
  name: string;
  slug: string;
  tagline: string | null;
  created_at: string;
}

export interface Entry {
  id: string;
  venture_id: string;
  seq: number;
  kind: string;
  title: string;
  body: string | null;
  occurred_at: string | null;
  recorded_at: string;
  content_hash: string;
  prev_hash: string;
  chain_hash: string;
}

export const ENTRY_KINDS = [
  "milestone",
  "revenue",
  "partnership",
  "launch",
  "other",
] as const;

export type EntryKind = (typeof ENTRY_KINDS)[number];
