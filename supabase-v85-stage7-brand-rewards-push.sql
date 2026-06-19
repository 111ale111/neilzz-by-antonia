-- neilzzbyanto V8.5 Stage 7 safe DB updates
-- Rulează o singură dată în Supabase SQL Editor.

alter table public.reviews
  add column if not exists photo_url text;

alter table public.client_rewards
  add column if not exists reward_type text,
  add column if not exists redeemed_at timestamptz;

alter table public.profiles
  add column if not exists push_enabled boolean default false,
  add column if not exists notification_permission text default 'unknown';

-- Creează bucket-urile dacă lipsesc. Nu atinge storage.objects, deci evită eroarea "must be owner of table objects".
insert into storage.buckets (id, name, public)
values
  ('review-photos', 'review-photos', true),
  ('avatars', 'avatars', true),
  ('inspirations', 'inspirations', true),
  ('gallery', 'gallery', true)
on conflict (id) do update set public = excluded.public;
