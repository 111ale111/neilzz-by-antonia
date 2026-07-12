create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

drop policy if exists "Clients manage own push subscriptions" on public.push_subscriptions;
create policy "Clients manage own push subscriptions"
  on public.push_subscriptions
  for all
  using (auth.uid() = client_id)
  with check (auth.uid() = client_id);

drop policy if exists "Admins read push subscriptions" on public.push_subscriptions;
create policy "Admins read push subscriptions"
  on public.push_subscriptions
  for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

-- Pentru push real pe telefon adaugă în Vercel:
-- NEXT_PUBLIC_VAPID_PUBLIC_KEY
-- VAPID_PRIVATE_KEY
-- VAPID_SUBJECT=mailto:emailul-tau@example.com
