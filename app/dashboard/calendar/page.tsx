export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft, Check, Home, X } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";

function formatDate(value: string) {
  return new Date(value + "T12:00:00").toLocaleDateString("ro-RO", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTime(value?: string | null) {
  return (value || "").slice(0, 5) || "—";
}

export default async function DashboardCalendarPage() {
  const { supabase } = await requireAdmin();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: appointments }, { data: profiles }] = await Promise.all([
    supabase
      .from("client_appointments")
      .select("id,client_id,appointment_date,appointment_time,status,note,custom_note")
      .gte("appointment_date", today)
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true }),
    supabase.from("profiles").select("id,full_name,email,avatar_url"),
  ]);

  const profileMap = new Map((profiles || []).map((profile: any) => [profile.id, profile]));
  const grouped = (appointments || []).reduce<Record<string, any[]>>((acc: Record<string, any[]>, item: any) => {
    (acc[item.appointment_date] ||= []).push(item);
    return acc;
  }, {});

  return (
    <main className="admin-shell px-5 py-7 md:px-8 md:py-10">
      <div className="lux-noise" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-3">
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm text-[var(--muted)]"><ArrowLeft className="h-4 w-4" /> Dashboard</Link>
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm text-[var(--muted)]"><Home className="h-4 w-4" /> Acasă</Link>
        </div>

        <header className="lux-panel rounded-[2.6rem] p-7 md:p-10">
          <p className="lux-label">Calendar Antonia</p>
          <h1 className="editorial-title mt-4 text-5xl leading-[0.92] md:text-7xl">Agenda viitoare</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--muted)] md:text-base">
            Programările viitoare grupate pe zile, clar și premium.
          </p>
        </header>

        <section className="mt-8 space-y-7">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date} className="lux-panel rounded-[2.2rem] p-6 md:p-7">
              <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
                <div>
                  <p className="lux-label">{date === today ? "Astăzi" : "Zi programări"}</p>
                  <h2 className="mt-2 font-serif text-4xl capitalize">{formatDate(date)}</h2>
                </div>
                <span className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm text-[var(--muted)]">{items.length} programări</span>
              </div>
              <div className="mt-5 grid gap-3">
                {items.map((item: any) => {
                  const profile = profileMap.get(item.client_id);
                  return (
                    <article key={item.id} className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--panel)] p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                          <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full border border-[var(--line)] bg-[var(--panel-strong)] text-[var(--rose-strong)]">
                            {profile?.avatar_url ? <img src={profile.avatar_url} alt="Clientă" className="h-full w-full object-cover" /> : (profile?.full_name || profile?.email || "NZ").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-serif text-3xl">{formatTime(item.appointment_time)} · {profile?.full_name || profile?.email || "Clientă"}</p>
                            <p className="mt-1 text-sm text-[var(--muted)]">{item.custom_note || item.note || "Fără notiță"}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className={item.status === "cancelled" ? "status-pill status-full mt-0" : item.status === "completed" ? "status-pill status-available mt-0" : "status-pill status-limited mt-0"}>{item.status === "completed" ? "Finalizată" : item.status === "cancelled" ? "Anulată" : "Urmează"}</span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
          {Object.keys(grouped).length === 0 && <div className="lux-panel rounded-[2rem] p-8 text-[var(--muted)]">Nu există programări viitoare.</div>}
        </section>
      </div>
    </main>
  );
}
