-- NEILZZ V8.5 Stage 6
-- Run this once in Supabase SQL Editor before testing review photos.

alter table public.reviews
add column if not exists photo_url text;

-- Create bucket manually if this insert fails because of storage ownership:
-- Supabase -> Storage -> New bucket -> review-photos -> Public
insert into storage.buckets (id, name, public)
values ('review-photos', 'review-photos', true)
on conflict (id) do update set public = true;
