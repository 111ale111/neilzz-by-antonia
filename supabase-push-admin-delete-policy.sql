-- =====================================================================
-- neilzzbyanto · Politică RLS: adminii pot șterge abonamentele expirate
-- din public.push_subscriptions (necesar ca ruta admin /api/push/send
-- să poată curăța endpoint-urile cu status 404/410).
-- NU modifică politica clientelor (auth.uid() = client_id). NU dezactiva RLS.
-- Rulează în Supabase SQL Editor.
-- =====================================================================

drop policy if exists "Admins delete stale push subscriptions"
  on public.push_subscriptions;

create policy "Admins delete stale push subscriptions"
  on public.push_subscriptions
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );
