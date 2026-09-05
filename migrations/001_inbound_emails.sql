-- Phase 2: DKIM inbound email ingestion.
-- Paste into the Neon SQL editor if not applied via tooling.
--
-- Beleg has no `milestones` table — milestones are `entries`.
-- Column is named milestone_id for product language; FK targets entries(id).

create extension if not exists "pgcrypto";

create table if not exists public.inbound_endpoints (
  id uuid primary key default gen_random_uuid(),
  venture_id uuid not null references public.ventures(id) on delete cascade,
  email_address text unique not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  last_ingested_at timestamptz
);

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
create index if not exists idx_inbound_endpoints_venture
  on public.inbound_endpoints (venture_id);
