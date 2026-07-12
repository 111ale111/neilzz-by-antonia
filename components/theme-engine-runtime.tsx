"use client";

import { useEffect } from "react";

const allowedAccents = new Set([
  "rose-gold",
  "champagne",
  "emerald",
  "sapphire",
  "bordeaux",
  "amethyst",
  "rose-paris",
  "amber",
  "turquoise",
  "onyx",
]);

function applyAccent(accent: string) {
  const safeAccent = allowedAccents.has(accent) ? accent : "rose-gold";
  document.documentElement.dataset.accent = safeAccent;
  window.localStorage.setItem("neilzz-accent", safeAccent);
}

export function ThemeEngineRuntime() {
  useEffect(() => {
    applyAccent(window.localStorage.getItem("neilzz-accent") || "rose-gold");

    function onAccentChanged(event: Event) {
      const detail = (event as CustomEvent<{ accent?: string }>).detail;
      applyAccent(detail?.accent || "rose-gold");
    }

    window.addEventListener("neilzz-accent-changed", onAccentChanged);
    return () => window.removeEventListener("neilzz-accent-changed", onAccentChanged);
  }, []);

  return null;
}
