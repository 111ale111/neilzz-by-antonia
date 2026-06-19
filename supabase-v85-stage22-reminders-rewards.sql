-- Stage 22/20 cleanup: supports booking status, reward labels and reminder-style notifications.
-- Safe to run multiple times.

alter table if exists public.client_rewards
  add column if not exists reward_type text;

alter table if exists public.client_notifications
  add column if not exists type text,
  add column if not exists status text;

-- Optional helper columns for future real cron reminders.
alter table if exists public.client_notifications
  add column if not exists scheduled_for timestamptz,
  add column if not exists delivered_at timestamptz;

-- Booking status can now also use: available, limited, full, vacation, closed.
