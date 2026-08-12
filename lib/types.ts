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

export const INGESTED_EMAIL_STATUSES = [
  "pending",
  "verified",
  "rejected",
  "milestone_created",
  "failed",
] as const;

export type IngestedEmailStatus = (typeof INGESTED_EMAIL_STATUSES)[number];

/** Unique inbound address for a venture (e.g. acme-a1b2c3d4@ingest.belegapp.com). */
export interface InboundEndpoint {
  id: string;
  venture_id: string;
  email_address: string;
  is_active: boolean;
  created_at: string;
  last_ingested_at: string | null;
}

/** Raw inbound email plus DKIM / processing status. */
export interface IngestedEmail {
  id: string;
  endpoint_id: string;
  /** Linked chain entry once a milestone is created from this email. */
  entry_id: string | null;
  raw_eml: string;
  plain_text_body: string | null;
  html_body: string | null;
  subject_line: string | null;
  from_address: string | null;
  sent_at: string | null;
  dkim_verified: boolean;
  dkim_domain: string | null;
  dkim_selector: string | null;
  verification_error: string | null;
  status: IngestedEmailStatus;
  processed_at: string | null;
  created_at: string;
  attachment_urls: unknown;
}

export const ENTRY_KINDS = [
  "milestone",
  "revenue",
  "partnership",
  "launch",
  "other",
] as const;

export type EntryKind = (typeof ENTRY_KINDS)[number];
