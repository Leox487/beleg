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

-- Allow stripe as an entry provenance source (safe if already present).
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'entries_source_check'
  ) then
    alter table public.entries
      add constraint entries_source_check
      check (source in ('manual', 'email', 'stripe'));
  end if;
end $$;
