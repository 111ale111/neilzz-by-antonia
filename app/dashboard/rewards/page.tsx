export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft, Gift, Home } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import { RewardCodePanel } from "@/components/admin/reward-code-panel";

export default async function DashboardRewardsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: rewards } = await supabase.from("client_rewards").select("*").order("issued_at", { ascending: false });
  const clientIds = Array.from(new Set((rewards || []).map((reward: any) => reward.client_id).filter(Boolean)));
  const { data: profiles } = clientIds.length
    ? await supabase.from("profiles").select("id,full_name,email").in("id", clientIds)
    : { data: [] as any[] };
  const profileMap = new Map((profiles || []).map((profile: any) => [profile.id, profile]));

  return (
    <main className="admin-shell px-5 py-7 md:px-8 md:py-10">
      <div className="lux-noise" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-3">
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm text-[var(--muted)]"><ArrowLeft className="h-4 w-4" /> Dashboard</Link>
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm text-[var(--muted)]"><Home className="h-4 w-4" /> Acasă</Link>
        </div>
        <header className="lux-panel rounded-[2.4rem] p-7 md:p-10">
          <p className="lux-label">Rewards</p>
          <h1 className="editorial-title mt-4 text-5xl leading-[0.92] md:text-7xl">Vouchere cliente</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--muted)] md:text-base">Verifică rapid codurile și marchează voucherele folosite după programare.</p>
        </header>

        <div className="mt-8"><RewardCodePanel /></div>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {(rewards || []).map((reward: any) => {
            const profile = profileMap.get(reward.client_id);
            return (
              <article key={reward.id} className="lux-panel rounded-[2rem] p-6">
                <Gift className="h-8 w-8 text-[var(--rose-strong)]" />
                <p className="lux-label mt-5">Reward #{reward.reward_number}</p>
                <h2 className="mt-3 font-serif text-4xl">{reward.code}</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">{profile?.full_name || profile?.email || "Clientă"}</p>
                <p className="mt-4 text-sm text-[var(--muted)]">Status: {reward.status} · {reward.reward_type || "reward"}</p>
              </article>
            );
          })}
          {(!rewards || rewards.length === 0) && <p className="text-[var(--muted)]">Nu există reward-uri generate încă.</p>}
        </section>
      </div>
    </main>
  );
}
