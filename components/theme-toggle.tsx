"use client";

import { Moon, Sun } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";

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

  if (!mounted) return <div className="h-11 w-11" aria-hidden="true" />;

  return (
    <Button
      type="button"
      variant="ghost"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleTheme}
      className="h-11 w-11 border border-[var(--line)] bg-[var(--panel)] p-0 text-[var(--text)] backdrop-blur-xl hover:bg-[var(--panel-strong)]"
    >
      {theme === "dark" ? <Sun className="h-[1.1rem] w-[1.1rem]" /> : <Moon className="h-[1.1rem] w-[1.1rem]" />}
    </Button>
  );
}
