export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { ClientManager } from "@/components/admin/client-manager";
import { requireAdmin } from "@/lib/auth/admin";

export default async function DashboardAppointmentsPage() {
  await requireAdmin();
  return (
    <main className="admin-shell px-5 py-7 md:px-8 md:py-10">
      <div className="lux-noise" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-3"><Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm text-[var(--muted)]"><ArrowLeft className="h-4 w-4" /> Dashboard</Link><Link href="/" className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm text-[var(--muted)]"><Home className="h-4 w-4" /> Acasă</Link></div>
        <header className="lux-panel rounded-[2.4rem] p-6 md:p-8"><p className="lux-label">Programări</p><h1 className="editorial-title mt-4 text-5xl leading-[0.92] md:text-7xl">Programare nouă</h1><p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--muted)] md:text-base">Aici adaugi o programare nouă. Agenda completă este separat în Dashboard → Calendar.</p></header>
        <div className="mt-8"><ClientManager mode="appointments" /></div>
      </div>
    </main>
  );
}
