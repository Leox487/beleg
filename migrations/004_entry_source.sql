-- Provenance metadata for email-ingested entries (outside the hash payload).
ALTER TABLE public.entries ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual';
ALTER TABLE public.entries ADD COLUMN IF NOT EXISTS dkim_verified boolean;
