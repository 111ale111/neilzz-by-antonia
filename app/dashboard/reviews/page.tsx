export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { ReviewsManager } from "@/components/admin/reviews-manager";
import { requireAdmin } from "@/lib/auth/admin";

export default async function DashboardReviewsPage() {
  await requireAdmin();

  return (
    <main className="admin-shell px-5 py-7 md:px-8 md:py-10">
      <div className="lux-noise" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2.5 text-sm font-semibold text-[var(--text)]">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2.5 text-sm font-semibold text-[var(--text)]">
            <Home className="h-4 w-4" /> Home
          </Link>
        </div>

        <header className="mt-8 rounded-[2rem] border border-[var(--line)] bg-[var(--panel)] p-6 backdrop-blur-2xl md:p-8">
          <p className="lux-label">Administrare review-uri</p>
          <h1 className="editorial-title mt-4 text-5xl leading-[0.92] md:text-7xl">Review-uri verificate</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--muted)] md:text-base">
            Aprobă sau respinge review-urile verificate înainte să apară public.
          </p>
        </header>

        <div className="mt-8">
          <ReviewsManager />
        </div>
      </div>
    </main>
  );
}
