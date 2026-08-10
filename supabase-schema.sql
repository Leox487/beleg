create extension if not exists "pgcrypto";

create table if not exists public.ventures (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  name text not null,
  slug text not null unique,
  tagline text,
  created_at timestamptz not null default now()
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
