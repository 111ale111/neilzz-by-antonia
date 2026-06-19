-- NEILZZ by Antonia V8.2 FULL WORKING SCHEMA
-- Rulează tot fișierul în Supabase SQL Editor după ce pui ZIP-ul.
-- După aceea rulează update-ul de la final cu emailul tău pentru admin.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  role text not null default 'client' check (role in ('client', 'admin')),
  is_activated boolean not null default false,
  visit_count integer not null default 0,
  loyalty_goal integer not null default 5,
  admin_notes text,
  notification_permission text default 'unknown',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists email text,
  add column if not exists full_name text,
  add column if not exists avatar_url text,
  add column if not exists role text not null default 'client',
  add column if not exists is_activated boolean not null default false,
  add column if not exists visit_count integer not null default 0,
  add column if not exists loyalty_goal integer not null default 5,
  add column if not exists admin_notes text,
  add column if not exists notification_permission text default 'unknown',
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  title text,
  image_url text not null,
  storage_path text,
  position integer default 0,
  is_visible boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.booking_days (
  id uuid primary key default gen_random_uuid(),
  date_label text not null,
  day_label text,
  status text not null default 'available' check (status in ('available', 'limited', 'full', 'vacation')),
  note text,
  position integer default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activation_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  is_used boolean not null default false,
  used_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  used_at timestamptz
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text,
  rating int not null default 5 check (rating between 1 and 5),
  text text not null,
  is_approved boolean not null default false,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.reviews add column if not exists is_featured boolean not null default false;

create table if not exists public.client_appointments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users(id) on delete cascade,
  appointment_date date not null,
  appointment_time time,
  status text not null default 'upcoming' check (status in ('upcoming', 'completed', 'cancelled')),
  note text,
  custom_note text,
  send_notifications boolean not null default true,
  confirmation_sent_at timestamptz,
  reminder_2d_sent_at timestamptz,
  reminder_1d_sent_at timestamptz,
  reminder_same_day_sent_at timestamptz,
  reminder_3h_sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.client_appointments
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

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, is_activated, visit_count, loyalty_goal)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'Clientă NEILZZ'),
    coalesce(nullif(new.raw_user_meta_data->>'role', ''), 'client'),
    case when new.raw_user_meta_data->>'role' = 'admin' then true else false end,
    0,
    5
  )
  on conflict (id) do update set
    email = coalesce(excluded.email, public.profiles.email),
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.gallery_images enable row level security;
alter table public.booking_days enable row level security;
alter table public.activation_codes enable row level security;
alter table public.reviews enable row level security;
alter table public.client_appointments enable row level security;
alter table public.client_rewards enable row level security;
alter table public.client_inspirations enable row level security;
alter table public.client_notifications enable row level security;
alter table public.site_settings enable row level security;
alter table storage.objects enable row level security;

-- Profiles
DROP POLICY IF EXISTS "profiles read" ON public.profiles;
DROP POLICY IF EXISTS "profiles insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles update" ON public.profiles;
CREATE POLICY "profiles read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_admin()) WITH CHECK (id = auth.uid() OR public.is_admin());

-- Gallery public read, admin manage
DROP POLICY IF EXISTS "gallery public read" ON public.gallery_images;
DROP POLICY IF EXISTS "gallery admin all" ON public.gallery_images;
CREATE POLICY "gallery public read" ON public.gallery_images FOR SELECT USING (is_visible = true OR public.is_admin());
CREATE POLICY "gallery admin all" ON public.gallery_images FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Booking public read, admin manage
DROP POLICY IF EXISTS "booking public read" ON public.booking_days;
DROP POLICY IF EXISTS "booking admin all" ON public.booking_days;
CREATE POLICY "booking public read" ON public.booking_days FOR SELECT USING (is_visible = true OR public.is_admin());
CREATE POLICY "booking admin all" ON public.booking_days FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Activation codes
DROP POLICY IF EXISTS "activation public unused read" ON public.activation_codes;
DROP POLICY IF EXISTS "activation authenticated use" ON public.activation_codes;
DROP POLICY IF EXISTS "activation admin all" ON public.activation_codes;
CREATE POLICY "activation public unused read" ON public.activation_codes FOR SELECT USING (is_used = false OR public.is_admin());
CREATE POLICY "activation authenticated use" ON public.activation_codes FOR UPDATE TO authenticated USING (is_used = false OR public.is_admin()) WITH CHECK ((is_used = true AND used_by = auth.uid()) OR public.is_admin());
CREATE POLICY "activation admin all" ON public.activation_codes FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Reviews
DROP POLICY IF EXISTS "reviews public approved" ON public.reviews;
DROP POLICY IF EXISTS "reviews insert activated" ON public.reviews;
DROP POLICY IF EXISTS "reviews admin all" ON public.reviews;
CREATE POLICY "reviews public approved" ON public.reviews FOR SELECT USING (is_approved = true OR user_id = auth.uid() OR public.is_admin());
CREATE POLICY "reviews insert activated" ON public.reviews FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND is_approved = false AND exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_activated = true));
CREATE POLICY "reviews admin all" ON public.reviews FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Client data
DROP POLICY IF EXISTS "appointments own read" ON public.client_appointments;
DROP POLICY IF EXISTS "appointments admin all" ON public.client_appointments;
CREATE POLICY "appointments own read" ON public.client_appointments FOR SELECT TO authenticated USING (client_id = auth.uid() OR public.is_admin());
CREATE POLICY "appointments admin all" ON public.client_appointments FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "rewards own read" ON public.client_rewards;
DROP POLICY IF EXISTS "rewards own insert" ON public.client_rewards;
DROP POLICY IF EXISTS "rewards admin all" ON public.client_rewards;
CREATE POLICY "rewards own read" ON public.client_rewards FOR SELECT TO authenticated USING (client_id = auth.uid() OR public.is_admin());
CREATE POLICY "rewards own insert" ON public.client_rewards FOR INSERT TO authenticated WITH CHECK (client_id = auth.uid() OR public.is_admin());
CREATE POLICY "rewards admin all" ON public.client_rewards FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "inspirations own read" ON public.client_inspirations;
DROP POLICY IF EXISTS "inspirations own insert" ON public.client_inspirations;
DROP POLICY IF EXISTS "inspirations own delete" ON public.client_inspirations;
DROP POLICY IF EXISTS "inspirations admin all" ON public.client_inspirations;
CREATE POLICY "inspirations own read" ON public.client_inspirations FOR SELECT TO authenticated USING (client_id = auth.uid() OR public.is_admin());
CREATE POLICY "inspirations own insert" ON public.client_inspirations FOR INSERT TO authenticated WITH CHECK (client_id = auth.uid() OR public.is_admin());
CREATE POLICY "inspirations own delete" ON public.client_inspirations FOR DELETE TO authenticated USING (client_id = auth.uid() OR public.is_admin());
CREATE POLICY "inspirations admin all" ON public.client_inspirations FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "notifications own read" ON public.client_notifications;
DROP POLICY IF EXISTS "notifications own update" ON public.client_notifications;
DROP POLICY IF EXISTS "notifications admin all" ON public.client_notifications;
CREATE POLICY "notifications own read" ON public.client_notifications FOR SELECT TO authenticated USING (client_id = auth.uid() OR public.is_admin());
CREATE POLICY "notifications own update" ON public.client_notifications FOR UPDATE TO authenticated USING (client_id = auth.uid() OR public.is_admin()) WITH CHECK (client_id = auth.uid() OR public.is_admin());
CREATE POLICY "notifications admin all" ON public.client_notifications FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "settings admin all" ON public.site_settings;
CREATE POLICY "settings admin all" ON public.site_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Storage buckets
insert into storage.buckets (id, name, public) values ('gallery', 'gallery', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('inspirations', 'inspirations', true) on conflict (id) do nothing;

DROP POLICY IF EXISTS "gallery storage public read" ON storage.objects;
DROP POLICY IF EXISTS "gallery storage admin insert" ON storage.objects;
DROP POLICY IF EXISTS "gallery storage admin delete" ON storage.objects;
DROP POLICY IF EXISTS "avatar storage public read" ON storage.objects;
DROP POLICY IF EXISTS "avatar storage own insert" ON storage.objects;
DROP POLICY IF EXISTS "inspiration storage public read" ON storage.objects;
DROP POLICY IF EXISTS "inspiration storage own insert" ON storage.objects;

CREATE POLICY "gallery storage public read" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
CREATE POLICY "gallery storage admin insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery' AND public.is_admin());
CREATE POLICY "gallery storage admin delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'gallery' AND public.is_admin());
CREATE POLICY "avatar storage public read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "avatar storage own insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "inspiration storage public read" ON storage.objects FOR SELECT USING (bucket_id = 'inspirations');
CREATE POLICY "inspiration storage own insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'inspirations' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Demo/default data so public pages are not empty.
insert into public.booking_days (date_label, day_label, status, note, position, is_visible)
values
  ('23 martie', 'Luni', 'full', 'Full', 1, true),
  ('24 martie', 'Marți', 'available', '1 loc liber', 2, true),
  ('25 martie', 'Miercuri', 'limited', 'Locuri limitate', 3, true)
on conflict do nothing;

insert into public.activation_codes (code, is_used)
values ('NEILZZ-ABC-123', false)
on conflict (code) do nothing;

-- IMPORTANT: după ce rulezi tot scriptul, setează contul tău ca admin:
-- update public.profiles set role = 'admin', is_activated = true where lower(email) = lower('EMAILUL_TAU');
