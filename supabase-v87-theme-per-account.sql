-- v87: Tema per cont (accent + atmosferă animată)
-- Tema nu mai e doar pe dispozitiv (localStorage), ci salvată în profilul
-- fiecărei cliente și aplicată la login pe orice dispozitiv.

alter table public.profiles
  add column if not exists accent text not null default 'rose-gold',
  add column if not exists atmosphere_enabled boolean not null default true;

-- Doar valori cunoscute de Theme Engine
alter table public.profiles
  drop constraint if exists profiles_accent_check;

alter table public.profiles
  add constraint profiles_accent_check check (
    accent in (
      'rose-gold', 'champagne', 'mocha', 'sapphire', 'amethyst',
      'emerald', 'bordeaux', 'amber', 'riviera', 'platinum'
    )
  );

-- Politicile RLS existente ("profiles update" cu id = auth.uid())
-- acoperă deja scrierea acestor coloane de către propria clientă.
