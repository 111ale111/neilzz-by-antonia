-- NEILZZ V7.0 Client Portal + Loyalty + Appointments
-- Rulează în Supabase SQL Editor după V6.1 sau direct pe proiectul curent.

alter table if exists public.profiles
add column if not exists email text,
add column if not exists full_name text,
add column if not exists avatar_url text,
add column if not exists role text not null default 'client',
add column if not exists is_activated boolean not null default false,
add column if not exists visit_count integer not null default 0,
add column if not exists loyalty_goal integer not null default 5;

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
  created_at timestamptz not null default now()
);

create table if not exists public.client_appointments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users(id) on delete cascade,
  appointment_date date not null,
  appointment_time time,
  status text not null default 'upcoming' check (status in ('upcoming', 'completed', 'cancelled')),
  note text,
  created_at timestamptz not null default now()
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

alter table public.profiles enable row level security;
alter table public.activation_codes enable row level security;
alter table public.reviews enable row level security;
alter table public.client_appointments enable row level security;

-- profiles
DROP POLICY IF EXISTS "own profile read" ON public.profiles;
DROP POLICY IF EXISTS "own profile upsert" ON public.profiles;
DROP POLICY IF EXISTS "own profile update" ON public.profiles;
DROP POLICY IF EXISTS "profiles select v70" ON public.profiles;
DROP POLICY IF EXISTS "profiles insert v70" ON public.profiles;
DROP POLICY IF EXISTS "profiles update v70" ON public.profiles;

CREATE POLICY "profiles select v70"
ON public.profiles FOR SELECT TO authenticated
USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "profiles insert v70"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (id = auth.uid() OR public.is_admin());

CREATE POLICY "profiles update v70"
ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid() OR public.is_admin())
WITH CHECK (id = auth.uid() OR public.is_admin());

-- activation codes
DROP POLICY IF EXISTS "activation codes readable for register" ON public.activation_codes;
DROP POLICY IF EXISTS "users can use activation code" ON public.activation_codes;
DROP POLICY IF EXISTS "admin activation code access" ON public.activation_codes;
DROP POLICY IF EXISTS "activation select v70" ON public.activation_codes;
DROP POLICY IF EXISTS "activation update v70" ON public.activation_codes;
DROP POLICY IF EXISTS "activation admin all v70" ON public.activation_codes;

CREATE POLICY "activation select v70"
ON public.activation_codes FOR SELECT
USING (is_used = false OR public.is_admin());

CREATE POLICY "activation update v70"
ON public.activation_codes FOR UPDATE TO authenticated
USING (is_used = false OR public.is_admin())
WITH CHECK ((is_used = true AND used_by = auth.uid()) OR public.is_admin());

CREATE POLICY "activation admin all v70"
ON public.activation_codes FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- reviews
DROP POLICY IF EXISTS "public approved reviews" ON public.reviews;
DROP POLICY IF EXISTS "activated users can insert reviews" ON public.reviews;
DROP POLICY IF EXISTS "admin review access" ON public.reviews;
DROP POLICY IF EXISTS "reviews select v70" ON public.reviews;
DROP POLICY IF EXISTS "reviews insert v70" ON public.reviews;
DROP POLICY IF EXISTS "reviews admin all v70" ON public.reviews;

CREATE POLICY "reviews select v70"
ON public.reviews FOR SELECT
USING (is_approved = true OR public.is_admin() OR user_id = auth.uid());

CREATE POLICY "reviews insert v70"
ON public.reviews FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND is_approved = false
  AND exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_activated = true)
);

CREATE POLICY "reviews admin all v70"
ON public.reviews FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- appointments
DROP POLICY IF EXISTS "appointments select v70" ON public.client_appointments;
DROP POLICY IF EXISTS "appointments admin all v70" ON public.client_appointments;

CREATE POLICY "appointments select v70"
ON public.client_appointments FOR SELECT TO authenticated
USING (client_id = auth.uid() OR public.is_admin());

CREATE POLICY "appointments admin all v70"
ON public.client_appointments FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());
