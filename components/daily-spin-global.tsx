"use client";

import { Gift, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";

const rewards = [
  { label: "5% OFF", detail: "Discount mic pentru următoarea programare." },
  { label: "Charms free", detail: "Charms bonus la următorul set." },
  { label: "French free", detail: "French gratuit când reward-ul este validat." },
  { label: "Mini gift", detail: "Cadou mic surpriză la vizită." },
  { label: "10% OFF", detail: "Discount special de test." },
  { label: "Try again", detail: "Nu ai prins reward acum, testează iar." },
];

function dailyResetCountdown() {
  const roNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Bucharest" }));
  const reset = new Date(roNow);
  reset.setDate(reset.getDate() + 1);
  reset.setHours(0, 0, 0, 0);
  const diff = Math.max(0, reset.getTime() - roNow.getTime());
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
}

export function DailySpinGlobal() {
  const [open, setOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ label: string; detail: string } | null>(null);
  const [dailyReset, setDailyReset] = useState("00h 00m 00s");
  const [streak, setStreak] = useState(3);

  useEffect(() => {
    setDailyReset(dailyResetCountdown());
    const timer = window.setInterval(() => setDailyReset(dailyResetCountdown()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  function testSpin() {
    if (spinning) return;
    setResult(null);
    setSpinning(true);
    window.setTimeout(() => {
      const reward = rewards[Math.floor(Math.random() * rewards.length)];
      setResult(reward);
      setStreak((value) => value + 1);
      setSpinning(false);
    }, 1200);
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="daily-floating-button" aria-label="Deschide daily spin">
        <Gift className="h-5 w-5" />
        <span>Daily spin</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[112] grid place-items-center bg-black/72 p-5 backdrop-blur-xl">
          <div className="lux-panel relative w-full max-w-4xl overflow-hidden rounded-[2.7rem] p-6 md:p-8">
            <button type="button" onClick={() => setOpen(false)} className="absolute right-5 top-5 rounded-full border border-[var(--line)] bg-[var(--panel)] p-3 text-[var(--text)]">
              <X className="h-4 w-4" />
            </button>
            <div className="grid gap-7 lg:grid-cols-[360px_1fr] lg:items-center">
              <div className={spinning ? "daily-wheel daily-wheel-spinning" : "daily-wheel"}>
                <div className="daily-wheel-center"><Gift className="h-8 w-8" /><span>Daily</span></div>
                <span className="daily-wheel-pointer" />
              </div>
              <div>
                <p className="lux-label">Daily reward test</p>
                <h2 className="editorial-title mt-3 text-5xl">Roata zilnică</h2>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">Mod test. Reward-urile sunt random doar ca să vedem flow-ul înainte să îi dăm drumul oficial.</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--panel)] p-4"><p className="lux-label">Reset România</p><p className="mt-2 font-serif text-3xl">{dailyReset}</p></div>
                  <div className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--panel)] p-4"><p className="lux-label">Streak</p><p className="mt-2 font-serif text-3xl">{streak} zile</p></div>
                </div>
                <div className="mt-5 grid gap-2 sm:grid-cols-3">
                  {rewards.map((reward) => <div key={reward.label} className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-3 text-sm text-[var(--muted)]"><Sparkles className="mb-2 h-4 w-4 text-[var(--rose-strong)]" />{reward.label}</div>)}
                </div>
                <button type="button" onClick={testSpin} disabled={spinning} className="lux-action lux-action-soft mt-6 rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-60">{spinning ? "Se învârte..." : "Testează roata"}</button>
                {result && <div className="mt-5 rounded-[1.7rem] border border-[var(--rose)]/35 bg-[color-mix(in_srgb,var(--rose)_10%,var(--panel))] p-5"><p className="lux-label">Ai picat</p><p className="mt-2 font-serif text-4xl">{result.label}</p><p className="mt-2 text-sm text-[var(--muted)]">{result.detail}</p></div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
