-- =====================================================================
-- neilzzbyanto · V92 · Sistem Carduri Cadou (gift_cards)
-- Rulează acest fișier în Supabase SQL Editor (după supabase-v82-full-working.sql).
-- =====================================================================

-- Asigură funcția is_admin() (există deja în v82; o recreăm ca fișierul să fie standalone).
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

-- Tabelul de carduri cadou
create table if not exists public.gift_cards (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  buyer_name text,
  recipient_name text,
  buyer_email text,
  recipient_email text,
  amount numeric not null default 0,
  message text,
  issued_at date not null default current_date,
  expires_at date,
  status text not null default 'active' check (status in ('active', 'used', 'expired', 'cancelled')),
  image_url text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Coloane sigure (dacă tabelul exista deja parțial)
alter table public.gift_cards
  add column if not exists buyer_name text,
  add column if not exists recipient_name text,
  add column if not exists buyer_email text,
  add column if not exists recipient_email text,
  add column if not exists amount numeric not null default 0,
  add column if not exists message text,
  add column if not exists issued_at date not null default current_date,
  add column if not exists expires_at date,
  add column if not exists status text not null default 'active',
  add column if not exists image_url text,
  add column if not exists created_by uuid,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create index if not exists gift_cards_code_idx on public.gift_cards (code);
create index if not exists gift_cards_recipient_email_idx on public.gift_cards (lower(recipient_email));
create index if not exists gift_cards_buyer_email_idx on public.gift_cards (lower(buyer_email));
create index if not exists gift_cards_status_idx on public.gift_cards (status);

-- Trigger pentru updated_at
create or replace function public.set_gift_cards_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists gift_cards_set_updated_at on public.gift_cards;
create trigger gift_cards_set_updated_at
before update on public.gift_cards
for each row execute procedure public.set_gift_cards_updated_at();

-- =====================================================================
-- RLS
-- =====================================================================
alter table public.gift_cards enable row level security;

-- Adminii: acces total (creare, citire, modificare, ștergere)
drop policy if exists "gift_cards admin all" on public.gift_cards;
create policy "gift_cards admin all" on public.gift_cards
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Utilizatoarea: vede DOAR cardurile asociate emailului ei (destinatar sau cumpărător)
drop policy if exists "gift_cards owner read" on public.gift_cards;
create policy "gift_cards owner read" on public.gift_cards
  for select to authenticated
  using (
    lower(coalesce(recipient_email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
    or lower(coalesce(buyer_email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

-- Notă: nu există policy pentru rolul `anon`, deci accesul public NU expune lista cardurilor.
