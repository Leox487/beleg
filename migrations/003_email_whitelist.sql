-- Sender whitelist for inbound email → milestone creation.
create table if not exists public.email_whitelist (
  id uuid primary key default gen_random_uuid(),
  venture_id uuid not null references public.ventures(id),
  sender_email text not null,
  created_at timestamptz not null default now(),
  unique (venture_id, sender_email)
);

create index if not exists whitelist_venture_idx on public.email_whitelist (venture_id);
