-- Durable rate-limit counters. The previous limiter lived in a per-instance
-- Map, which resets on every cold start and is not shared across the
-- serverless fleet, so concurrent callers each got a fresh budget.
--
-- Fixed window: `window_start` is the bucket the hit landed in. A row whose
-- window_start is older than the caller's current bucket is reset to 1 rather
-- than incremented, so one row per key is all we ever keep.
create table if not exists public.rate_limits (
  key text primary key,
  window_start timestamptz not null,
  hits integer not null default 0
);

-- Supports the cron sweep below.
create index if not exists rate_limits_window_start_idx
  on public.rate_limits (window_start);
