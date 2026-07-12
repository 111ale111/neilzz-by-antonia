import type { Metadata } from "next";
import Link from "next/link";
import { Camera, Gift, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { instagramHandle, instagramUrl } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Card cadou · neilzzbyanto",
  description: "Oferă o experiență neilzzbyanto — card cadou personalizat cu valoarea aleasă de tine.",
};

const perks = [
  "Personalizat cu numele persoanei dragi",
  "Mesaj special ales de tine",
  "Suma dorită, fără limite",
];

export default function GiftCardPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--bg)] px-5 pb-24 pt-28 text-[var(--text)] md:px-8 md:pt-32">
      <div className="lux-noise" />
      <SiteHeader />

      <div className="relative z-10 mx-auto max-w-3xl">
        <header className="text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[color-mix(in_srgb,var(--cream)_24%,var(--line))] bg-[var(--panel-strong)] text-[var(--rose-strong)] backdrop-blur-xl">
            <Gift className="h-6 w-6" />
          </span>
          <h1 className="editorial-title mt-6 text-5xl leading-[0.95] md:text-6xl">Oferă o experiență neilzzbyanto</h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[var(--muted)]">
            Vrei să surprinzi pe cineva drag cu un cadou special? Oferă-i o sesiune de manichiură sau un
            card cadou cu valoarea aleasă de tine. Cardul poate fi personalizat cu numele persoanei, un
            mesaj special și suma dorită.
          </p>
        </header>

        <section className="mt-11 overflow-hidden rounded-[2.2rem] border border-[color-mix(in_srgb,var(--cream)_22%,var(--line))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel-strong)_92%,transparent),color-mix(in_srgb,var(--panel)_92%,transparent))] p-7 shadow-[inset_0_1px_0_rgba(255,255,255,.10),0_28px_80px_var(--shadow)] backdrop-blur-xl md:p-9">
          <ul className="grid gap-3 sm:grid-cols-3">
            {perks.map((perk) => (
              <li key={perk} className="flex items-start gap-2.5 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm text-[var(--muted)]">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--rose-strong)]" />
                {perk}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex justify-center">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="lux-action lux-action-solid inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 text-sm font-extrabold"
            >
              <Camera className="h-4 w-4" /> Comandă pe Instagram
            </a>
          </div>

          <p className="mx-auto mt-7 max-w-xl text-center text-sm leading-7 text-[var(--muted)]">
            Contactează-mă pe Instagram pentru plată și personalizare. Cardul cadou va fi pregătit digital
            și poate fi trimis sau printat.
          </p>
        </section>

        <div className="mt-8 text-center">
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-[0.28em] text-[var(--faint)] transition hover:text-[var(--rose-strong)]">
            {instagramHandle}
          </a>
        </div>
      </div>

      <footer className="relative z-10 mt-16 flex justify-center">
        <Link href="/" className="inline-flex items-center">
          <img src="/neilzz-logo-light.png" alt="neilzzbyanto" className="h-12 w-auto object-contain opacity-75" />
        </Link>
      </footer>
    </main>
  );
}
