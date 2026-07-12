export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft, LineChart } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";
import { DashboardAnalytics } from "@/components/admin/dashboard-analytics";

export default async function DashboardAnalyticsPage() {
  const { supabase } = await requireAdmin();
  return (
    <main className="admin-shell app-shell-bg px-5 py-7 md:px-8 md:py-10">
      <div className="lux-noise" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <header className="lux-panel rounded-[2.6rem] p-6 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="lux-label">Analytics</p>
              <h1 className="editorial-title mt-4 text-5xl md:text-6xl">Activitate aplicație</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">Statisticile complete sunt aici, ca dashboard-ul principal să rămână curat.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2.5 text-sm font-semibold"><ArrowLeft className="h-4 w-4" /> Înapoi</Link>
              <span className="guide-lux-button inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-extrabold"><LineChart className="h-4 w-4" /> Analytics</span>
            </div>
          </div>
        </header>
        <DashboardAnalytics supabase={supabase} />
      </div>
    </main>
  );
}
