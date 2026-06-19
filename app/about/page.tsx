import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { GraduationCap, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

const values = [
  { title: "2+ ani experiență", text: "Lucru constant, focus pe formă, rezistență și finish curat.", icon: Sparkles },
  { title: "Cursuri & perfecționare", text: "Tehnicile sunt îmbunătățite continuu pentru rezultate mai sigure.", icon: GraduationCap },
  { title: "Sterilizare & igienă", text: "Instrumente pregătite atent și standard clar de curățenie.", icon: ShieldCheck },
  { title: "Experiență privată", text: "Fiecare programare este discutată personal, fără grabă și fără template.", icon: HeartHandshake },
];

export default function AboutPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--bg)] px-5 pb-20 pt-28 text-[var(--text)] md:px-8 md:pt-32">
      <SiteHeader />
      <div className="lux-noise" />
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="soft-pulse absolute left-[8%] top-[4%] h-72 w-72 rounded-full bg-[var(--wine)]/42 blur-[130px]" />
        <div className="soft-pulse absolute right-[8%] top-[18%] h-80 w-80 rounded-full bg-[var(--rose)]/12 blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">

        <section className="py-14 md:py-20">
          <p className="lux-label">About Antonia</p>
          <h1 className="editorial-title mt-5 max-w-5xl text-5xl leading-[0.9] md:text-7xl">
            Nail work gândit ca o experiență privată, curată și premium.
          </h1>
          <p className="mt-7 max-w-3xl text-base leading-8 text-[var(--muted)] md:text-lg">
            neilzzbyanto este un atelier privat pentru cliente care vor detalii curate, formă elegantă și un finish discret-luxury. Fiecare set este construit cu atenție la structură, igienă și preferințele clientei.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {values.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="lux-panel rounded-[2.2rem] p-7">
                <Icon className="h-9 w-9 text-[var(--rose-strong)]" />
                <h2 className="mt-6 font-serif text-4xl">{item.title}</h2>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{item.text}</p>
              </article>
            );
          })}
        </section>

        <section className="mt-10 lux-panel rounded-[2.4rem] p-7 md:p-10">
          <p className="lux-label">Private appointment</p>
          <h2 className="mt-4 font-serif text-5xl">Cum se lucrează</h2>
          <div className="mt-6 grid gap-4 text-sm leading-7 text-[var(--muted)] md:grid-cols-3">
            <p><b className="text-[var(--text)]">1. Inspirație</b><br />Trimiți ideile, forma, lungimea și vibe-ul dorit.</p>
            <p><b className="text-[var(--text)]">2. Set personalizat</b><br />Programarea este adaptată pentru un rezultat curat și rezistent.</p>
            <p><b className="text-[var(--text)]">3. Cont privat</b><br />După cont, poți salva inspirații, vedea rewards și programările.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
