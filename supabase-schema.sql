create extension if not exists "pgcrypto";

create table if not exists public.ventures (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  name text not null,
  slug text not null unique,
  tagline text,
  created_at timestamptz not null default now(),
  -- Latest OpenTimestamps .ots proof (base64) for browser / independent verify.
  ots_file_base64 text
);
create index if not exists ventures_user_idx on public.ventures (clerk_user_id);

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  venture_id uuid not null references public.ventures(id),
  seq integer not null,
  kind text not null default 'milestone',
  title text not null,
  body text,
  occurred_at date,
  recorded_at timestamptz not null default now(),
  content_hash text not null,
  prev_hash text not null,
  chain_hash text not null,
  -- Provenance metadata (not part of the hash chain payload).
  source text not null default 'manual'
    check (source in ('manual', 'email', 'stripe')),
  dkim_verified boolean,
  unique (venture_id, seq)
);
create index if not exists entries_venture_idx on public.entries (venture_id, seq);

create table if not exists public.attestations (
  id uuid primary key default gen_random_uuid(),
  venture_id uuid not null references public.ventures(id),
  entry_id uuid references public.entries(id),
  attester_email text not null,
  attester_name text,
  statement text not null,
  attester_note text,
  token text not null unique,
  status text not null default 'pending',
  requested_at timestamptz not null default now(),
  confirmed_at timestamptz,
  chain_entry_id uuid references public.entries(id)
);
create index if not exists attestations_venture_idx on public.attestations (venture_id);

-- OpenTimestamps anchors: each row seals a chain tip (highest seq entry and its
-- chain_hash) to Bitcoin via an .ots proof. ots_proof is base64 of the serialized
-- proof bytes. status starts 'pending' and becomes 'confirmed' once the proof
-- upgrades to carry a Bitcoin block attestation.
create table if not exists public.anchors (
  id uuid primary key default gen_random_uuid(),
  venture_id uuid not null references public.ventures(id),
  anchored_seq integer not null,
  chain_tip_hash text not null,
  ots_proof text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  upgraded_at timestamptz,
  bitcoin_block_height integer
);
create index if not exists anchors_venture_idx on public.anchors (venture_id, created_at desc);

-- Inbound email ingestion: each venture gets a unique address on INGEST_EMAIL_DOMAIN
-- (e.g. ingest.belegapp.com when that subdomain is verified for Resend receiving).
-- Beleg stores milestones as entries; milestone_id → entries(id).
create table if not exists public.inbound_endpoints (
  id uuid primary key default gen_random_uuid(),
  venture_id uuid not null references public.ventures(id) on delete cascade,
  email_address text unique not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  last_ingested_at timestamptz
);
create index if not exists idx_inbound_endpoints_venture
  on public.inbound_endpoints (venture_id);

create table if not exists public.ingested_emails (
  id uuid primary key default gen_random_uuid(),
  endpoint_id uuid not null references public.inbound_endpoints(id) on delete cascade,
  milestone_id uuid references public.entries(id) on delete set null,
  raw_eml text not null,
  plain_text_body text,
  html_body text,
  subject_line text,
  from_address text,
  sent_at timestamptz,
  dkim_verified boolean default false,
  dkim_domain text,
  dkim_selector text,
  verification_error text,
  status text default 'pending'
    check (status in ('pending', 'verified', 'rejected', 'milestone_created', 'failed')),
  processed_at timestamptz,
  created_at timestamptz default now(),
  attachment_urls jsonb default '[]'::jsonb
);
create index if not exists idx_ingested_emails_endpoint
  on public.ingested_emails (endpoint_id);
create index if not exists idx_ingested_emails_status
  on public.ingested_emails (status);

-- Allowed From: addresses for auto-creating milestones from inbound email.
create table if not exists public.email_whitelist (
  id uuid primary key default gen_random_uuid(),
  venture_id uuid not null references public.ventures(id),
  sender_email text not null,
  created_at timestamptz not null default now(),
  unique (venture_id, sender_email)
);
create index if not exists whitelist_venture_idx on public.email_whitelist (venture_id);

-- Per-venture Stripe webhook connector. Secret key is AES-256-GCM encrypted.
create table if not exists public.stripe_connections (
  id uuid primary key default gen_random_uuid(),
  venture_id uuid not null references public.ventures(id),
  clerk_user_id text not null,
  stripe_account_id text not null,
  stripe_secret_key_enc text,
  webhook_secret text not null,
  created_at timestamptz not null default now(),
  unique (venture_id)
);
create index if not exists stripe_connections_venture_idx
  on public.stripe_connections (venture_id);

-- Dedup Stripe / Resend (Svix) webhook deliveries so retries do not
-- append duplicate ledger entries.
create table if not exists public.processed_webhook_ids (
  id text primary key,
  processed_at timestamptz not null default now()
);
