-- Sender whitelist for inbound email → milestone creation.
create table if not exists public.email_whitelist (
  id uuid primary key default gen_random_uuid(),
  venture_id uuid not null references public.ventures(id) on delete cascade,
  sender_email text not null,
  created_at timestamptz default now(),
  unique (venture_id, sender_email)
);

create index if not exists idx_email_whitelist_venture
  on public.email_whitelist (venture_id);
