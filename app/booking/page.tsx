"use client";

import { ArrowUpRight, CalendarDays, Camera, MessageCircle, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SiteHeader } from "@/components/site-header";

const INSTAGRAM_URL = "https://instagram.com/neilzz_by.anto";

type BookingDay = {
  id: string;
  date_label: string;
  day_label: string | null;
  status: string;
  note: string | null;
  position: number | null;
};

type PublicSettings = {
  publicBookingEnabled?: boolean;
  appStatus?: string;
};

const fallbackBooking: BookingDay[] = [
  { id: "b1", date_label: "17 iulie", day_label: "Joi", status: "available", note: null, position: 1 },
  { id: "b2", date_label: "18 iulie", day_label: "Vineri", status: "limited", note: null, position: 2 },
  { id: "b3", date_label: "19 iulie", day_label: "Sâmbătă", status: "full", note: null, position: 3 },
];

const steps = [
  { icon: MessageCircle, title: "Trimite inspirația", text: "Scrie pe Instagram cu poza de inspirație, forma dorită și perioada preferată." },
  { icon: Sparkles, title: "Stabilim detaliile", text: "Antonia confirmă dacă designul, durata și ziua sunt potrivite." },
  { icon: CalendarDays, title: "Primești confirmarea", text: "Programarea se confirmă privat, fără formular public și fără pași inutili." },
];

function statusLabel(status: string, note?: string | null) {
  if (note) return note;
  if (status === "full") return "Complet";
  if (status === "closed") return "Închis temporar";
  if (status === "vacation") return "Concediu";
  if (status === "limited") return "Locuri limitate";
  return "Disponibil";
}

function isBookingClosed(settings: PublicSettings): boolean {
  return (
    settings.publicBookingEnabled === false ||
    settings.appStatus === "vacation" ||
    settings.appStatus === "closed"
  );
}

function displayDateLabel(dateLabel: string) {
  const clean = dateLabel.trim();
  if (/^\d{1,2}$/.test(clean)) return `${clean} iulie`;
  return clean;
}

function statusClass(status: string) {
  if (status === "full") return "status-pill status-full";
  if (status === "closed") return "status-pill status-full";
  if (status === "vacation") return "status-pill status-vacation";
  if (status === "limited") return "status-pill status-limited";
  return "status-pill status-available";
}

function statusDotClass(status: string) {
  if (status === "full") return "bg-red-300 shadow-[0_0_22px_rgba(252,165,165,.78)]";
  if (status === "closed") return "bg-zinc-300 shadow-[0_0_22px_rgba(212,212,216,.55)]";
  if (status === "vacation") return "bg-amber-300 shadow-[0_0_22px_rgba(252,211,77,.72)]";
  if (status === "limited") return "bg-yellow-300 shadow-[0_0_22px_rgba(253,224,71,.72)]";
  return "bg-emerald-300 shadow-[0_0_22px_rgba(110,231,183,.74)]";
}

export default function BookingPage() {
  const [days, setDays] = useState<BookingDay[]>([]);
  const [settings, setSettings] = useState<PublicSettings>({ publicBookingEnabled: true, appStatus: "active" });

  useEffect(() => {
    async function loadBooking() {
      const supabase = createClient();
      const [{ data, error }, { data: settingsData }] = await Promise.all([
        supabase
          .from("booking_days")
          .select("id,date_label,day_label,status,note,position")
          .eq("is_visible", true)
          .order("position", { ascending: true })
          .order("created_at", { ascending: false })
          .limit(8),
        supabase.from("site_settings").select("value").eq("key", "homepage_features").maybeSingle(),
      ]);

      if (!error && data && data.length > 0) setDays(data);
      if (settingsData?.value && typeof settingsData.value === "object") {
        setSettings({ publicBookingEnabled: true, appStatus: "active", ...(settingsData.value as PublicSettings) });
      }
    }

    loadBooking();
  }, []);

  const closed = isBookingClosed(settings);

  const displayDays = useMemo(() => {
    const base = days.length > 0 ? days : fallbackBooking;
    if (settings.appStatus === "limited") {
      return base.map((day, index) => (index === 0 ? { ...day, status: "limited", note: day.note || "Programări limitate" } : day));
    }
    return base;
  }, [days, settings]);

  const availableDays = displayDays.filter((d) => !["full", "closed", "vacation"].includes(d.status));
  const hasDays = !closed && availableDays.length > 0;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--bg)] px-4 pb-24 pt-28 text-[var(--text)] sm:px-5 md:px-8 md:pt-32">
      <SiteHeader />
      <div className="lux-noise" />
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="soft-pulse absolute left-[8%] top-[6%] h-64 w-64 rounded-full bg-[var(--wine)]/35 blur-[80px]" />
        <div className="soft-pulse absolute right-[8%] top-[22%] h-64 w-64 rounded-full bg-[var(--rose)]/10 blur-[80px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1100px]">
        <section className="py-8 md:py-10">
          <p className="lux-label">Programări private</p>
          <h1 className="editorial-title mt-4 max-w-3xl text-[2.75rem] leading-[0.94] sm:text-6xl md:text-7xl">
            {closed ? "Programările sunt momentan închise" : "Programări private, finish perfect."}
          </h1>

          {closed ? (
            <>
              <p className="mt-6 max-w-xl text-base leading-8 text-[var(--muted)]">
                Pentru întrebări sau pentru a discuta o viitoare programare, trimite-mi un mesaj pe Instagram.
              </p>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="lux-action lux-action-solid mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-extrabold sm:w-auto">
                <Camera className="h-4 w-4" /> Scrie-mi pe Instagram
              </a>
            </>
          ) : (
            <>
              <p className="mt-6 max-w-xl text-base leading-8 text-[var(--muted)]">
                Programările se fac prin Instagram pentru ca fiecare set să fie confirmat personal, curat și fără formular rece.
              </p>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="lux-action lux-action-soft mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold sm:w-auto">
                <Camera className="h-4 w-4" /> Cere programare <ArrowUpRight className="h-4 w-4" />
              </a>
            </>
          )}
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          {steps.map((step, index) => (
            <article key={step.title} className="lux-panel rounded-[1.6rem] p-5">
              <div className="grid h-11 w-11 place-items-center rounded-full border border-[var(--line)] bg-[var(--panel-strong)] text-[var(--rose-strong)]">
                <step.icon className="h-5 w-5" />
              </div>
              <p className="mt-5 text-xs uppercase tracking-[0.3em] text-[var(--faint)]">0{index + 1}</p>
              <h3 className="mt-2 font-serif text-2xl">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{step.text}</p>
            </article>
          ))}
        </section>

        {hasDays && (
          <section className="mt-12">
            <p className="lux-label">Disponibilitate</p>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl">Zile disponibile</h2>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {displayDays.map((day) => (
                <article key={day.id} className="rounded-[1.4rem] border border-[var(--line)] bg-[var(--panel)] p-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs uppercase tracking-[0.22em] text-[var(--faint)]">{day.day_label || "Zi"}</p>
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${statusDotClass(day.status)}`} />
                  </div>
                  <h3 className="mt-3 font-serif text-2xl">{displayDateLabel(day.date_label)}</h3>
                  <span className={statusClass(day.status)}>{statusLabel(day.status, day.note)}</span>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
