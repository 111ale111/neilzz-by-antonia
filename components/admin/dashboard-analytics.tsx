import { CalendarDays, MousePointerClick, Radio, UsersRound } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";

type Props = {
  supabase: SupabaseClient<any, any, any>;
};

async function safeCount(query: PromiseLike<{ count: number | null; error: unknown }>) {
  try {
    const result = await query;
    return result.error ? 0 : result.count || 0;
  } catch {
    return 0;
  }
}

function todayStartIso() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

function StatCard({ label, value, hint, icon: Icon }: { label: string; value: number; hint: string; icon: typeof Radio }) {
  return (
    <article className="lux-panel rounded-[2rem] p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="lux-label">{label}</p>
          <p className="mt-4 font-serif text-6xl leading-none">{value}</p>
        </div>
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--panel-strong)] text-[var(--rose-strong)]">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-sm text-[var(--muted)]">{hint}</p>
    </article>
  );
}

export async function DashboardAnalytics({ supabase }: Props) {
  const start = todayStartIso();
  const [viewsToday, bookingClicks, instagramClicks, accountsCreated, notificationsOn, upcomingAppointments] = await Promise.all([
    safeCount(supabase.from("site_analytics").select("id", { count: "exact", head: true }).eq("event_name", "page_view").gte("created_at", start)),
    safeCount(supabase.from("site_analytics").select("id", { count: "exact", head: true }).eq("event_name", "booking_click")),
    safeCount(supabase.from("site_analytics").select("id", { count: "exact", head: true }).eq("event_name", "instagram_click")),
    safeCount(supabase.from("profiles").select("id", { count: "exact", head: true })),
    safeCount(supabase.from("profiles").select("id", { count: "exact", head: true }).eq("notification_permission", "granted")),
    safeCount(supabase.from("client_appointments").select("id", { count: "exact", head: true }).gte("appointment_date", new Date().toISOString().slice(0, 10)).eq("status", "upcoming")),
  ]);

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="lux-label">Analytics</p>
          <h2 className="mt-3 font-serif text-4xl">Activitate aplicație</h2>
        </div>
        <p className="hidden max-w-sm text-right text-sm text-[var(--muted)] md:block">Tracking intern simplu: views, clickuri și acțiuni importante. Dacă tabelul SQL nu este încă rulat, valorile rămân 0.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Views azi" value={viewsToday} hint="Page views începând cu ora 00:00." icon={Radio} />
        <StatCard label="Booking clicks" value={bookingClicks} hint="Clickuri pe programare / booking." icon={CalendarDays} />
        <StatCard label="Instagram clicks" value={instagramClicks} hint="Clickuri către Instagram." icon={MousePointerClick} />
        <StatCard label="Conturi" value={accountsCreated} hint="Total profile în aplicație." icon={UsersRound} />
        <StatCard label="Notificări ON" value={notificationsOn} hint="Cliente cu permission granted." icon={Radio} />
        <StatCard label="Programări" value={upcomingAppointments} hint="Programări viitoare active." icon={CalendarDays} />
      </div>
    </section>
  );
}
