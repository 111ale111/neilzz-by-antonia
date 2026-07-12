import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Servicii & Prețuri · neilzzbyanto",
  description: "Lista de prețuri neilzzbyanto — mărimi, modele și servicii de manichiură premium.",
};

type Row = { label: string; price: string };

const groups: { title: string; rows: Row[] }[] = [
  {
    title: "Mărimi",
    rows: [
      { label: "De la 0–4", price: "120 lei" },
      { label: "De la 5", price: "170 lei" },
    ],
  },
  {
    title: "Modele",
    rows: [
      { label: "French", price: "+20 lei" },
      { label: "Modele încărcate", price: "+30 lei" },
      { label: "Charm-uri", price: "+20 lei" },
    ],
  },
  {
    title: "Altele",
    rows: [
      { label: "Semi", price: "90 lei" },
      { label: "Întreținere", price: "100 lei" },
      { label: "Dat jos material din altă parte", price: "30 lei" },
    ],
  },
];

function PriceCard({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <section className="flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-[color-mix(in_srgb,var(--cream)_22%,var(--line))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel-strong)_92%,transparent),color-mix(in_srgb,var(--panel)_92%,transparent))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.10),0_20px_54px_var(--shadow)] backdrop-blur-xl md:p-6">
      <div className="flex items-center gap-2.5">
        <Sparkles className="h-5 w-5 shrink-0 text-[color-mix(in_srgb,var(--cream)_78%,var(--rose-strong))]" />
        <h2 className="font-serif text-2xl md:text-3xl">{title}</h2>
      </div>
      <div className="mt-3 h-px w-full bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--cream)_34%,transparent),transparent)]" />
      <ul className="mt-4 space-y-3">
        {rows.map((row) => (
          <li key={row.label} className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 flex-1 text-[0.92rem] text-[var(--muted)]">{row.label}</span>
            <span className="shrink-0 font-serif text-lg text-[var(--text)] md:text-xl">{row.price}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function ServiciiPreturiPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--bg)] px-4 pb-20 pt-24 text-[var(--text)] sm:px-5 md:px-8 md:pt-28">
      <div className="lux-noise" />
      <SiteHeader />

      <div className="relative z-10 mx-auto max-w-[1080px]">
        <header className="text-center">
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.4em] text-[color-mix(in_srgb,var(--cream)_70%,var(--rose-strong))]">
            neilzzbyanto
          </p>
          <h1 className="editorial-title mt-3 text-[2.6rem] leading-[0.98] sm:text-5xl md:text-6xl">Servicii &amp; Prețuri</h1>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--cream)_26%,var(--line))] bg-[var(--panel)] px-4 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[var(--muted)] backdrop-blur-xl">
            Price list
          </div>
        </header>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 md:items-stretch">
          {groups.map((group) => (
            <PriceCard key={group.title} title={group.title} rows={group.rows} />
          ))}
        </div>

        <p className="mx-auto mt-6 max-w-2xl text-center text-sm leading-7 text-[var(--muted)]">
          Prețul final poate varia în funcție de lungime, complexitatea modelului și materialele folosite.
        </p>

        <div className="mt-7 flex justify-center">
          <Link
            href="/booking"
            className="lux-action lux-action-solid inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-4 text-sm font-extrabold sm:w-auto"
          >
            <CalendarDays className="h-4 w-4" /> Programează-te acum
          </Link>
        </div>

        <footer className="mt-12 flex flex-col items-center gap-3">
          <img src="/neilzz-logo-light.png" alt="neilzzbyanto" className="h-11 w-auto object-contain opacity-75" />
          <Link href="/gift-card" className="text-xs uppercase tracking-[0.26em] text-[var(--faint)] transition hover:text-[var(--rose-strong)]">
            Card cadou
          </Link>
        </footer>
      </div>
    </main>
  );
}
