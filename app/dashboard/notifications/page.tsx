export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft, Bell, CalendarClock, Gift, Home, Sparkles, UserRound } from "lucide-react";
import { NotificationComposer } from "@/components/admin/notification-composer";
import { requireAdmin } from "@/lib/auth/admin";

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function iconFor(type?: string | null) {
  if (type === "appointment") return <CalendarClock className="h-5 w-5" />;
  if (type === "reward") return <Gift className="h-5 w-5" />;
  if (type === "rank") return <Sparkles className="h-5 w-5" />;
  return <Bell className="h-5 w-5" />;
}

function groupLabel(dateValue?: string | null) {
  if (!dateValue) return "Earlier";
  const date = new Date(dateValue);
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startYesterday = startToday - 24 * 60 * 60 * 1000;
  const time = date.getTime();
  if (time >= startToday) return "Today";
  if (time >= startYesterday) return "Yesterday";
  return "This week";
}

export default async function DashboardNotificationsPage() {
  const { supabase } = await requireAdmin();

  const [{ data: notifications }, { data: profiles }] = await Promise.all([
    supabase
      .from("client_notifications")
      .select("id,client_id,title,message,type,status,created_at,read_at")
      .order("created_at", { ascending: false })
      .limit(80),
    supabase.from("profiles").select("id,email,full_name,notification_permission,updated_at").order("updated_at", { ascending: false }),
  ]);

  const list = notifications || [];
  const profileMap = new Map((profiles || []).map((profile) => [profile.id, profile]));
  const unread = list.filter((item) => !item.read_at).length;
  const disabled = (profiles || []).filter((profile) => profile.notification_permission !== "granted").length;
  const groups = ["Today", "Yesterday", "This week"].map((label) => ({ label, items: list.filter((item) => groupLabel(item.created_at) === label) })).filter((group) => group.items.length > 0);

  return (
    <main className="admin-shell px-5 py-7 md:px-8 md:py-10">
      <div className="lux-noise" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-3">
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm text-[var(--muted)]">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm text-[var(--muted)]">
            <Home className="h-4 w-4" /> Home
          </Link>
        </div>

        <header className="lux-panel overflow-hidden rounded-[2.7rem] p-7 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <p className="lux-label">Notifications</p>
              <h1 className="editorial-title mt-4 text-5xl leading-[0.92] md:text-7xl">Luxury timeline</h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--muted)] md:text-base">
                Notificări in-app pentru programări, rewards, rank updates și conturi. Push browser rămâne pentru etapa următoare.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4"><p className="font-serif text-3xl">{list.length}</p><p className="mt-1 text-xs text-[var(--muted)]">total</p></div>
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4"><p className="font-serif text-3xl">{unread}</p><p className="mt-1 text-xs text-[var(--muted)]">unread</p></div>
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4"><p className="font-serif text-3xl">{disabled}</p><p className="mt-1 text-xs text-[var(--muted)]">off</p></div>
            </div>
          </div>
        </header>

        <div className="mt-8">
          <NotificationComposer profiles={(profiles || []).map((profile) => ({ id: profile.id, email: profile.email, full_name: profile.full_name, notification_permission: profile.notification_permission }))} />
        </div>

        <section className="mt-8 lux-panel rounded-[2.5rem] p-6 md:p-8">
          {groups.map((group) => (
            <div key={group.label} className="mb-10 last:mb-0">
              <div className="mb-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-[var(--line)]" />
                <p className="lux-label">✦ {group.label}</p>
                <span className="h-px flex-1 bg-[var(--line)]" />
              </div>
              <div className="space-y-4">
                {group.items.map((item) => {
                  const profile = profileMap.get(item.client_id);
                  return (
                    <article key={item.id} className="grid gap-4 rounded-[2rem] border border-[var(--line)] bg-[var(--panel)] p-5 transition hover:-translate-y-0.5 hover:bg-[var(--panel-strong)] md:grid-cols-[56px_1fr_auto] md:items-start">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[var(--line)] bg-[var(--panel-strong)] text-[var(--rose-strong)]">
                        {iconFor(item.type)}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="lux-label">{item.type || "in-app"}</p>
                          <span className="rounded-full border border-[var(--line)] px-3 py-1 text-xs text-[var(--muted)]">{item.read_at ? "Read" : item.status || "Pending"}</span>
                        </div>
                        <h2 className="mt-3 font-serif text-3xl">{item.title}</h2>
                        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">{item.message}</p>
                        <p className="mt-4 inline-flex items-center gap-2 text-xs text-[var(--faint)]"><UserRound className="h-3.5 w-3.5" /> {profile?.full_name || profile?.email || "Clientă"}</p>
                      </div>
                      <div className="text-left text-xs uppercase tracking-[0.22em] text-[var(--faint)] md:text-right">{formatDate(item.created_at)}</div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
          {list.length === 0 && <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--panel)] p-7 text-sm text-[var(--muted)]">Nu există notificări încă.</div>}
        </section>
      </div>
    </main>
  );
}
