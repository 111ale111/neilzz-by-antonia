-- NEILZZ Stage 21: analytics + branding settings

create table if not exists public.site_analytics (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  page_path text,
  session_id text,
  user_agent text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.site_analytics enable row level security;

drop policy if exists "Anyone can insert site analytics" on public.site_analytics;
create policy "Anyone can insert site analytics"
  on public.site_analytics for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Admins can read site analytics" on public.site_analytics;
create policy "Admins can read site analytics"
  on public.site_analytics for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

insert into public.site_settings (key, value, updated_at)
values
  ('brand_assets', '{"logoUrl":"/neilzz-logo-light.png"}'::jsonb, now()),
  ('homepage_content', '{"badge":"Private nail atelier","titleLine1":"Quiet luxury.","titleLine2":"Perfect finish.","subtitle":"Forme curate, detalii fine și un finish premium — gândit ca o experiență privată, nu ca un template.","primaryCta":"Vezi galeria","secondaryCta":"Programează-te","instagramHandle":"@neilzz_by.anto","instagramUrl":"https://instagram.com/neilzz_by.anto"}'::jsonb, now())
on conflict (key) do nothing;

-- Optional but recommended for logo upload from Settings:
-- Supabase Storage -> create public bucket named: site-assets
