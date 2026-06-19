"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const SESSION_KEY = "neilzz-analytics-session";

function getSessionId() {
  if (typeof window === "undefined") return "server";
  let value = window.localStorage.getItem(SESSION_KEY);
  if (!value) {
    value = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(SESSION_KEY, value);
  }
  return value;
}

export function trackEvent(eventName: string, metadata: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const supabase = createClient();
  supabase
    .from("site_analytics")
    .insert({
      event_name: eventName,
      page_path: window.location.pathname,
      session_id: getSessionId(),
      user_agent: window.navigator.userAgent,
      metadata,
    })
    .then(() => undefined);
}

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    trackEvent("page_view", { pathname });
  }, [pathname]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const link = target?.closest("a") as HTMLAnchorElement | null;
      if (!link) return;
      const href = link.getAttribute("href") || "";
      const label = link.textContent?.trim().slice(0, 90) || href;
      if (href.includes("instagram.com")) trackEvent("instagram_click", { href, label });
      if (href.includes("wa.me") || href.includes("whatsapp")) trackEvent("whatsapp_click", { href, label });
      if (href.includes("/booking") || label.toLowerCase().includes("program") || label.toLowerCase().includes("slot")) {
        trackEvent("booking_click", { href, label });
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
