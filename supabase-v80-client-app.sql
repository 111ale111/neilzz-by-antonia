-- NEILZZ V8.0 Client Portal / Rewards / Inspirations / Notifications
-- Rulează în Supabase SQL Editor după ce faci deploy la V8.0.

alter table if exists public.profiles
add column if not exists email text,
add column if not exists full_name text,
add column if not exists avatar_url text,
add column if not exists role text not null default 'client',
add column if not exists is_activated boolean not null default false,
add column if not exists visit_count integer not null default 0,
add column if not exists loyalty_goal integer not null default 5,
add column if not exists admin_notes text,
add column if not exists notification_permission text default 'unknown';

alter table if exists public.client_appointments
add column if not exists custom_note text,
add column if not exists send_notifications boolean not null default true,
add column if not exists confirmation_sent_at timestamptz,
add column if not exists reminder_2d_sent_at timestamptz,
add column if not exists reminder_1d_sent_at timestamptz,
add column if not exists reminder_same_day_sent_at timestamptz,
add column if not exists reminder_3h_sent_at timestamptz;

create table if not exists public.client_rewards (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users(id) on delete cascade,
  reward_number integer not null default 1,
  reward_type text not null default '50% OFF',
  code text unique not null,
  status text not null default 'active' check (status in ('active', 'redeemed', 'expired')),
  issued_at timestamptz not null default now(),
  redeemed_at timestamptz
);

create table if not exists public.client_inspirations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users(id) on delete cascade,
  image_url text not null,
  title text,
  note text,
  source_type text not null default 'upload' check (source_type in ('upload', 'gallery')),
  source_gallery_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.client_notifications (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'general',
  title text not null,
  message text not null,
  status text default 'in_app',
  created_at timestamptz not null default now(),
  read_at timestamptz,
  delivered_at timestamptz
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('inspirations', 'inspirations', true)
on conflict (id) do nothing;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.client_rewards enable row level security;
alter table public.client_inspirations enable row level security;
alter table public.client_notifications enable row level security;
alter table public.site_settings enable row level security;
alter table storage.objects enable row level security;

-- Profiles
DROP POLICY IF EXISTS "profiles select v80" ON public.profiles;
DROP POLICY IF EXISTS "profiles insert v80" ON public.profiles;
DROP POLICY IF EXISTS "profiles update v80" ON public.profiles;
CREATE POLICY "profiles select v80" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles insert v80" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles update v80" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_admin()) WITH CHECK (id = auth.uid() OR public.is_admin());

-- Rewards
DROP POLICY IF EXISTS "rewards select v80" ON public.client_rewards;
DROP POLICY IF EXISTS "rewards insert v80" ON public.client_rewards;
DROP POLICY IF EXISTS "rewards update v80" ON public.client_rewards;
DROP POLICY IF EXISTS "rewards admin all v80" ON public.client_rewards;
CREATE POLICY "rewards select v80" ON public.client_rewards FOR SELECT TO authenticated USING (client_id = auth.uid() OR public.is_admin());
CREATE POLICY "rewards insert v80" ON public.client_rewards FOR INSERT TO authenticated WITH CHECK (client_id = auth.uid() OR public.is_admin());
CREATE POLICY "rewards update v80" ON public.client_rewards FOR UPDATE TO authenticated USING (client_id = auth.uid() OR public.is_admin()) WITH CHECK (client_id = auth.uid() OR public.is_admin());
CREATE POLICY "rewards admin all v80" ON public.client_rewards FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Inspirations
DROP POLICY IF EXISTS "inspirations select v80" ON public.client_inspirations;
DROP POLICY IF EXISTS "inspirations insert v80" ON public.client_inspirations;
DROP POLICY IF EXISTS "inspirations delete v80" ON public.client_inspirations;
DROP POLICY IF EXISTS "inspirations admin all v80" ON public.client_inspirations;
CREATE POLICY "inspirations select v80" ON public.client_inspirations FOR SELECT TO authenticated USING (client_id = auth.uid() OR public.is_admin());
CREATE POLICY "inspirations insert v80" ON public.client_inspirations FOR INSERT TO authenticated WITH CHECK (client_id = auth.uid() OR public.is_admin());
CREATE POLICY "inspirations delete v80" ON public.client_inspirations FOR DELETE TO authenticated USING (client_id = auth.uid() OR public.is_admin());
CREATE POLICY "inspirations admin all v80" ON public.client_inspirations FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Notifications
DROP POLICY IF EXISTS "notifications select v80" ON public.client_notifications;
DROP POLICY IF EXISTS "notifications insert v80" ON public.client_notifications;
DROP POLICY IF EXISTS "notifications update v80" ON public.client_notifications;
DROP POLICY IF EXISTS "notifications admin all v80" ON public.client_notifications;
CREATE POLICY "notifications select v80" ON public.client_notifications FOR SELECT TO authenticated USING (client_id = auth.uid() OR public.is_admin());
CREATE POLICY "notifications insert v80" ON public.client_notifications FOR INSERT TO authenticated WITH CHECK (client_id = auth.uid() OR public.is_admin());
CREATE POLICY "notifications update v80" ON public.client_notifications FOR UPDATE TO authenticated USING (client_id = auth.uid() OR public.is_admin()) WITH CHECK (client_id = auth.uid() OR public.is_admin());
CREATE POLICY "notifications admin all v80" ON public.client_notifications FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Settings
DROP POLICY IF EXISTS "settings admin v80" ON public.site_settings;
CREATE POLICY "settings admin v80" ON public.site_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Storage policies
DROP POLICY IF EXISTS "avatar public read v80" ON storage.objects;
DROP POLICY IF EXISTS "avatar upload v80" ON storage.objects;
DROP POLICY IF EXISTS "inspiration public read v80" ON storage.objects;
DROP POLICY IF EXISTS "inspiration upload v80" ON storage.objects;
CREATE POLICY "avatar public read v80" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "avatar upload v80" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "inspiration public read v80" ON storage.objects FOR SELECT USING (bucket_id = 'inspirations');
CREATE POLICY "inspiration upload v80" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'inspirations' AND (storage.foldername(name))[1] = auth.uid()::text);
