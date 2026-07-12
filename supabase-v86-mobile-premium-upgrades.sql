-- Stage 26 / V86: mobile premium account, custom notifications and booking status sync.
-- Safe to run multiple times in Supabase SQL Editor.

alter table if exists public.client_notifications
  add column if not exists type text,
  add column if not exists status text,
  add column if not exists scheduled_for timestamptz,
  add column if not exists delivered_at timestamptz,
  add column if not exists read_at timestamptz;

create index if not exists client_notifications_client_created_idx
  on public.client_notifications (client_id, created_at desc);

create index if not exists client_notifications_scheduled_idx
  on public.client_notifications (scheduled_for)
  where scheduled_for is not null;

-- Booking page now reads site_settings.homepage_features.appStatus.
-- Supported appStatus values: active, limited, vacation, closed.
