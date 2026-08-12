-- Phase 3: store the .ots proof on the venture for browser verification.
alter table public.ventures
  add column if not exists ots_file_base64 text;
