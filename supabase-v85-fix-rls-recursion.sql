-- NEILZZ V8.5 quick fix: opreste infinite recursion pe public.profiles
-- Ruleaza tot in Supabase SQL Editor.

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

-- Sterge toate policy-urile vechi de pe profiles care pot chema public.is_admin()
drop policy if exists "own profile read" on public.profiles;
drop policy if exists "own profile upsert" on public.profiles;
drop policy if exists "own profile update" on public.profiles;
drop policy if exists "profiles select v70" on public.profiles;
drop policy if exists "profiles insert v70" on public.profiles;
drop policy if exists "profiles update v70" on public.profiles;
drop policy if exists "profiles select v80" on public.profiles;
drop policy if exists "profiles insert v80" on public.profiles;
drop policy if exists "profiles update v80" on public.profiles;
drop policy if exists "profiles read" on public.profiles;
drop policy if exists "profiles insert" on public.profiles;
drop policy if exists "profiles update" on public.profiles;
drop policy if exists "profiles read v85 no recursion" on public.profiles;
drop policy if exists "profiles insert own v85" on public.profiles;
drop policy if exists "profiles update v85 dev" on public.profiles;

alter table public.profiles enable row level security;

-- Fara public.is_admin() aici. Asta elimina recursia.
create policy "profiles read v85 no recursion"
on public.profiles
for select
to authenticated
using (true);

create policy "profiles insert own v85"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

-- Pentru proiect/prototip: permite userilor logati sa updateze profiles.
-- Asta face Save Profile + admin client edit sa mearga fara recursie.
create policy "profiles update v85 dev"
on public.profiles
for update
to authenticated
using (true)
with check (true);

-- Asigura adminul pe emailul tau actual.
insert into public.profiles (id, email, full_name, role, is_activated, visit_count, loyalty_goal, created_at)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
  'admin',
  true,
  0,
  5,
  now()
from auth.users u
where lower(u.email) = lower('alessios1testsender@gmail.com')
on conflict (id) do update
set
  email = excluded.email,
  role = 'admin',
  is_activated = true;
