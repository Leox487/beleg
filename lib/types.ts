export interface Venture {
  id: string;
  clerk_user_id: string;
  name: string;
  slug: string;
  tagline: string | null;
  created_at: string;
  /** Latest OpenTimestamps .ots proof (base64), when Bitcoin-anchored. */
  ots_file_base64?: string | null;
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

export interface Attestation {
  id: string;
  venture_id: string;
  entry_id: string | null;
  attester_email: string;
  attester_name: string | null;
  statement: string;
  /** Optional facts/details the attester added when confirming. */
  attester_note: string | null;
  token: string;
  status: string;
  requested_at: string;
  confirmed_at: string | null;
  chain_entry_id: string | null;
}

export interface Anchor {
  id: string;
  venture_id: string;
  anchored_seq: number;
  chain_tip_hash: string;
  ots_proof: string;
  status: string;
  created_at: string;
  upgraded_at: string | null;
  bitcoin_block_height: number | null;
}

export type {
  InboundEndpoint,
  IngestedEmail,
} from "@/lib/db/types";

export const ENTRY_KINDS = [
  "milestone",
  "revenue",
  "partnership",
  "launch",
  "other",
] as const;

export type EntryKind = (typeof ENTRY_KINDS)[number];
