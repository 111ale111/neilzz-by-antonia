"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, CalendarDays, Camera, CheckCircle2, MessageCircle, Sparkles } from "lucide-react";
import Link from "next/link";
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

const fallbackBooking: BookingDay[] = [
  { id: "b1", date_label: "17 iulie", day_label: "Joi", status: "available", note: null, position: 1 },
  { id: "b2", date_label: "18 iulie", day_label: "Vineri", status: "limited", note: null, position: 2 },
  { id: "b3", date_label: "19 iulie", day_label: "Sâmbătă", status: "full", note: null, position: 3 },
];

const steps = [
  { icon: MessageCircle, title: "Trimite inspirația", text: "Scrie pe Instagram cu poza de inspirație, forma dorită și perioada preferată." },
  { icon: Sparkles, title: "Stabilim detaliile", text: "Antonia confirmă dacă designul, durata și ziua sunt potrivite." },
  { icon: CalendarDays, title: "Primești ora", text: "Programarea se confirmă privat, fără formular public și fără pași inutili." },
];

function statusLabel(status: string, note?: string | null) {
  if (note) return note;
  if (status === "full") return "Complet ocupat";
  if (status === "vacation") return "Concediu";
  if (status === "limited") return "Locuri limitate";
  return "Disponibil";
}

function displayDateLabel(dateLabel: string) {
  const clean = dateLabel.trim();
  if (/^\d{1,2}$/.test(clean)) return `${clean} iulie`;
  return clean;
}

function statusClass(status: string) {
  if (status === "full") return "status-pill status-full";
  if (status === "vacation") return "status-pill status-vacation";
  if (status === "limited") return "status-pill status-limited";
  return "status-pill status-available";
}

function statusDotClass(status: string) {
  if (status === "full") return "bg-red-300 shadow-[0_0_22px_rgba(252,165,165,.78)]";
  if (status === "vacation") return "bg-amber-300 shadow-[0_0_22px_rgba(252,211,77,.72)]";
  if (status === "limited") return "bg-yellow-300 shadow-[0_0_22px_rgba(253,224,71,.72)]";
  return "bg-emerald-300 shadow-[0_0_22px_rgba(110,231,183,.74)]";
}

export default function BookingPage() {
  const [days, setDays] = useState<BookingDay[]>([]);

  useEffect(() => {
    async function loadBooking() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("booking_days")
        .select("id,date_label,day_label,status,note,position")
        .eq("is_visible", true)
        .order("position", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(8);

      if (!error && data && data.length > 0) setDays(data);
    }

    loadBooking();
  }, []);

  const displayDays = useMemo(() => (days.length > 0 ? days : fallbackBooking), [days]);
  const nextDay = displayDays[0];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--bg)] px-5 pb-24 pt-28 text-[var(--text)] md:px-8 md:pt-32">
      <SiteHeader />
      <div className="lux-noise" />
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="soft-pulse absolute left-[8%] top-[4%] h-72 w-72 rounded-full bg-[var(--wine)]/42 blur-[130px]" />
        <div className="soft-pulse absolute right-[8%] top-[18%] h-80 w-80 rounded-full bg-[var(--rose)]/12 blur-[140px]" />
      </div>
      <span className="sparkle left-[15%] top-[18%]" />
      <span className="sparkle right-[18%] top-[32%] [animation-delay:2.2s]" />

      <div className="relative z-10 mx-auto max-w-[1320px]">

        <section className="grid items-center gap-10 py-10 lg:grid-cols-[1fr_.82fr] lg:py-10">
          <motion.div initial={{ opacity: 0, y: 30, filter: "blur(14px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.85 }}>
            <p className="lux-label">Programări private</p>
            <h1 className="editorial-title mt-5 max-w-4xl text-6xl leading-[0.9] md:text-8xl">
              Programări private.
              <br /> Finish perfect.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-[var(--muted)]">
              Programările se fac prin Instagram pentru ca fiecare set să fie confirmat personal, curat și fără formular rece.
            </p>
            {nextDay.status === "vacation" ? (
              <div className="mt-8 inline-flex items-center justify-center rounded-full border border-[var(--line)] bg-[var(--panel)] px-6 py-3.5 text-sm font-semibold text-[var(--muted)]">
                Programările sunt închise în perioada de concediu
              </div>
            ) : (
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="lux-action lux-action-soft mt-8 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold">
                <Camera className="h-4 w-4" /> Cere programare <ArrowUpRight className="h-4 w-4" />
              </a>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30, filter: "blur(14px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.85, delay: 0.12 }} className="lux-panel rounded-[2.5rem] p-6 md:p-8">
            <div className="flex items-start gap-4">
              <span className={`mt-2 h-2.5 w-2.5 rounded-full ${statusDotClass(nextDay.status)}`} />
              <div>
                <p className="lux-label">Următoarea perioadă</p>
                <h2 className="mt-5 font-serif text-5xl leading-none tracking-[-0.03em] md:text-6xl">{displayDateLabel(nextDay.date_label)}</h2>
                <span className={statusClass(nextDay.status)}>
                  {statusLabel(nextDay.status, nextDay.note)}
                </span>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.article key={step.title} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} className="lux-panel rounded-[2rem] p-6">
              <div className="grid h-12 w-12 place-items-center rounded-full border border-[var(--line)] bg-[var(--panel-strong)] text-[var(--rose-strong)]">
                <step.icon className="h-5 w-5" />
              </div>
              <p className="mt-7 text-xs uppercase tracking-[0.35em] text-[var(--faint)]">0{index + 1}</p>
              <h3 className="mt-3 font-serif text-3xl">{step.title}</h3>
              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{step.text}</p>
            </motion.article>
          ))}
        </section>

        <section className="mt-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="lux-label">Disponibilitate</p>
              <h2 className="mt-3 font-serif text-4xl md:text-5xl">Zile afișate</h2>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {displayDays.map((day) => (
              <article key={day.id} className="rounded-[1.7rem] border border-[var(--line)] bg-[var(--panel)] p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.28em] text-[var(--faint)]">{day.day_label || "Zi"}</p>
                  <span className={`h-2.5 w-2.5 rounded-full ${statusDotClass(day.status)}`} />
                </div>
                <h3 className="mt-4 font-serif text-3xl">{displayDateLabel(day.date_label)}</h3>
                <span className={statusClass(day.status)}>
                  {statusLabel(day.status, day.note)}
                </span>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
