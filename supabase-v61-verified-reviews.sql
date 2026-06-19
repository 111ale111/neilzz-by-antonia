-- NEILZZ V6.1 Verified Reviews System
-- Rulează acest SQL în Supabase SQL Editor înainte să testezi /register și /dashboard/reviews.

alter table if exists public.profiles
add column if not exists email text,
add column if not exists is_activated boolean not null default false;

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

alter table public.activation_codes enable row level security;
alter table public.reviews enable row level security;
alter table public.profiles enable row level security;

-- Public can check exact unused codes during register.
drop policy if exists "activation codes readable for register" on public.activation_codes;
create policy "activation codes readable for register"
on public.activation_codes for select
using (is_used = false);

-- Logged users can mark their code as used during account activation.
drop policy if exists "users can use activation code" on public.activation_codes;
create policy "users can use activation code"
on public.activation_codes for update
to authenticated
using (is_used = false)
with check (is_used = true and used_by = auth.uid());

-- Admin full access to activation codes.
drop policy if exists "admin activation code access" on public.activation_codes;
create policy "admin activation code access"
on public.activation_codes for all
to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Public can read approved reviews.
drop policy if exists "public approved reviews" on public.reviews;
create policy "public approved reviews"
on public.reviews for select
using (is_approved = true or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Activated clients can create reviews, but not approve them.
drop policy if exists "activated users can insert reviews" on public.reviews;
create policy "activated users can insert reviews"
on public.reviews for insert
to authenticated
with check (
  user_id = auth.uid()
  and is_approved = false
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_activated = true)
);

-- Admin can manage all reviews.
drop policy if exists "admin review access" on public.reviews;
create policy "admin review access"
on public.reviews for all
to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Users can read and update their own profile. Admin can read/manage profiles.
drop policy if exists "own profile read" on public.profiles;
create policy "own profile read"
on public.profiles for select
to authenticated
using (id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "own profile upsert" on public.profiles;
create policy "own profile upsert"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "own profile update" on public.profiles;
create policy "own profile update"
on public.profiles for update
to authenticated
using (id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
