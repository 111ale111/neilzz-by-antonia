"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaInstallCard() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function install() {
    if (promptEvent) {
      await promptEvent.prompt();
      await promptEvent.userChoice.catch(() => undefined);
      setPromptEvent(null);
      return;
    }
    setOpen(true);
  }

  return (
    <>
      <button type="button" onClick={install} className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold">
        <Download className="mr-2 inline h-4 w-4" /> Instalează pe iPhone
      </button>
      {open && (
        <div className="fixed inset-0 z-[120] grid place-items-center bg-black/70 p-5 backdrop-blur-xl">
          <div className="lux-panel max-w-md rounded-[2.2rem] p-7">
            <div className="flex items-start justify-between gap-4">
              <div><p className="lux-label">PWA install</p><h3 className="mt-3 font-serif text-4xl">Adaugă pe ecran</h3></div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-[var(--line)] p-2 text-[var(--muted)]"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-5 space-y-3 text-sm leading-7 text-[var(--muted)]">
              <p>Pe iPhone: deschide site-ul în Safari.</p>
              <p>Apasă Share.</p>
              <p>Alege „Add to Home Screen”.</p>
              <p>După instalare, neilzzbyanto se deschide ca o aplicație.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
