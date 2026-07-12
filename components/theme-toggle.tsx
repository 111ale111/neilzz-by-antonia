"use client";

import { Moon, Sun } from "lucide-react";
import * as React from "react";

function getStoredTheme() {
  if (typeof window === "undefined") return "dark";
  return window.localStorage.getItem("neilzz-theme") || document.documentElement.dataset.theme || "dark";
}

export function ThemeToggle() {
  const [theme, setTheme] = React.useState("dark");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const saved = getStoredTheme();
    document.documentElement.dataset.theme = saved;
    window.localStorage.setItem("neilzz-theme", saved);
    setTheme(saved);
    setMounted(true);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("neilzz-theme", next);
    setTheme(next);
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Schimbă pe light mode" : "Schimbă pe dark mode"}
      onClick={toggleTheme}
      className="theme-pill-button"
    >
      <span className="grid h-8 w-8 place-items-center rounded-full border border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_70%,transparent)] text-[var(--rose-strong)]">
        {mounted ? (isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />) : <Sun className="h-4 w-4" />}
      </span>
      
    </button>
  );
}
