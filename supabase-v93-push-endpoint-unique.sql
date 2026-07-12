-- =====================================================================
-- neilzzbyanto · V93 · Constraint UNIQUE pe push_subscriptions.endpoint
-- Necesar pentru upsert-ul cu onConflict: "endpoint".
-- Fără el, salvarea subscripției eșuează (0 rânduri în push_subscriptions).
-- Rulează în Supabase SQL Editor.
-- =====================================================================

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'push_subscriptions_endpoint_key'
  ) then
    alter table public.push_subscriptions
      add constraint push_subscriptions_endpoint_key unique (endpoint);
  end if;
end $$;

-- Verificare rapidă a abonamentelor salvate:
-- select id, client_id, endpoint, user_agent, created_at
-- from public.push_subscriptions
-- order by created_at desc;
