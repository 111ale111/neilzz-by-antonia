export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowUpRight, CalendarDays, Camera, ClipboardList, Gift, Home, LogOut, Settings, Star, UserRound, UsersRound } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";
import { DashboardAnalytics } from "@/components/admin/dashboard-analytics";

const cards = [
  { href: "/dashboard/clients", title: "Cliente", text: "Conturi, vizite, activări și notițe private.", icon: UsersRound },
  { href: "/dashboard/calendar", title: "Calendar", text: "Vezi programările următoare, grupate frumos pe zile.", icon: ClipboardList },
  { href: "/dashboard/appointments", title: "Programare nouă", text: "Adaugă rapid o programare nouă pentru o clientă.", icon: CalendarDays },
  { href: "/dashboard/reviews", title: "Review-uri", text: "Aprobă review-uri și pozele trimise de cliente.", icon: Star },
  { href: "/dashboard/rewards", title: "Vouchere", text: "Verifică reward-uri și marchează codurile folosite.", icon: Gift },
  { href: "/dashboard/gallery", title: "Galerie", text: "Lucrări publice și imagini salvabile în inspirații.", icon: Camera },
  { href: "/dashboard/booking", title: "Booking", text: "Status public pentru disponibilitate și concediu.", icon: CalendarDays },
  { href: "/dashboard/settings", title: "Setări", text: "Featured sections și statusul aplicației.", icon: Settings },
];

function formatDate(value: string) {
  return new Date(value + "T12:00:00").toLocaleDateString("ro-RO", { weekday: "long", day: "2-digit", month: "long" });
}
function formatTime(value?: string | null) { return (value || "").slice(0, 5) || "—"; }

export default async function DashboardPage() {
  const { supabase, user } = await requireAdmin();
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const [{ count: pendingReviews }, { count: activeRewards }, { count: tomorrowAppointments }, appointmentsRes, profilesRes] = await Promise.all([
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("is_approved", false),
    supabase.from("client_rewards").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("client_appointments").select("id", { count: "exact", head: true }).eq("appointment_date", tomorrow),
    supabase.from("client_appointments").select("id,client_id,appointment_date,appointment_time,status,custom_note,note").gte("appointment_date", today).eq("status", "upcoming").order("appointment_date", { ascending: true }).order("appointment_time", { ascending: true }).limit(8),
    supabase.from("profiles").select("id,full_name,email"),
  ]);

  const profiles = new Map((profilesRes.data || []).map((p: any) => [p.id, p]));
  const agenda = (appointmentsRes.data || []).reduce<Record<string, any[]>>((acc: Record<string, any[]>, item: any) => {
    (acc[item.appointment_date] ||= []).push(item);
    return acc;
  }, {});

  return (
    <main className="admin-shell px-5 py-7 md:px-8 md:py-10">
      <div className="lux-noise" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <header className="lux-panel overflow-hidden rounded-[2.8rem] p-7 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <p className="lux-label">Acces privat</p>
              <h1 className="editorial-title mt-4 text-5xl leading-[0.92] md:text-7xl">Panou Antonia</h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--muted)] md:text-base">Tot ce contează într-un singur loc: agenda următoare, review-uri, vouchere și controlul clientelor.</p>
              <p className="mt-3 text-xs text-[var(--faint)]">Logat ca {user.email}</p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2.5 text-sm font-semibold text-[var(--text)]"><Home className="h-4 w-4" /> Acasă</Link>
              <Link href="/account" className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2.5 text-sm font-semibold text-[var(--text)]"><UserRound className="h-4 w-4" /> Cont</Link>
              <a href="/auth/logout" className="logout-lux inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold"><LogOut className="h-4 w-4" /> Logout</a>
            </div>
          </div>
        </header>

        <DashboardAnalytics supabase={supabase} />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <Link href="/dashboard/reviews" className="lux-panel rounded-[2rem] p-6 transition hover:-translate-y-1"><p className="lux-label">Review-uri</p><p className="mt-4 font-serif text-6xl">{pendingReviews || 0}</p><p className="mt-2 text-sm text-[var(--muted)]">în așteptare</p></Link>
          <Link href="/dashboard/calendar" className="lux-panel rounded-[2rem] p-6 transition hover:-translate-y-1"><p className="lux-label">Mâine</p><p className="mt-4 font-serif text-6xl">{tomorrowAppointments || 0}</p><p className="mt-2 text-sm text-[var(--muted)]">programări</p></Link>
          <Link href="/dashboard/rewards" className="lux-panel rounded-[2rem] p-6 transition hover:-translate-y-1"><p className="lux-label">Vouchere</p><p className="mt-4 font-serif text-6xl">{activeRewards || 0}</p><p className="mt-2 text-sm text-[var(--muted)]">active</p></Link>
        </section>

        <section className="mt-8 lux-panel rounded-[2.4rem] p-6 md:p-8">
          <div className="flex items-end justify-between gap-4"><div><p className="lux-label">Calendar</p><h2 className="mt-3 font-serif text-4xl">Programările următoare</h2></div><Link href="/dashboard/calendar" className="rounded-full border border-[var(--line)] px-4 py-2 text-sm text-[var(--muted)]">Vezi calendar</Link></div>
          <div className="mt-7 space-y-6">
            {Object.entries(agenda).map(([date, items]) => (
              <div key={date}>
                <p className="lux-label">{formatDate(date)}</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {items.map((item: any) => { const p = profiles.get(item.client_id); return <article key={item.id} className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4"><p className="font-serif text-3xl">{formatTime(item.appointment_time)} · {p?.full_name || p?.email || "Clientă"}</p><p className="mt-1 text-sm text-[var(--muted)]">{item.custom_note || item.note || "Fără notiță"}</p></article>; })}
                </div>
              </div>
            ))}
            {Object.keys(agenda).length === 0 && <p className="text-sm text-[var(--muted)]">Nu există programări viitoare.</p>}
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => { const Icon = card.icon; return <Link key={card.title} href={card.href} className="lux-panel group rounded-[2.2rem] p-7 transition hover:-translate-y-1 hover:bg-[var(--panel-strong)]"><div className="flex items-center justify-between"><span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--panel-strong)]"><Icon className="h-5 w-5 text-[var(--rose-strong)]" /></span><ArrowUpRight className="h-5 w-5 text-[var(--faint)] transition group-hover:text-[var(--rose-strong)]" /></div><h2 className="mt-7 font-serif text-4xl">{card.title}</h2><p className="mt-4 text-sm leading-7 text-[var(--muted)]">{card.text}</p></Link>; })}
        </section>
      </div>
    </main>
  );
}
