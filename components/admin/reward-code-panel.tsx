"use client";

import { useState } from "react";
import { CheckCircle2, Search, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Result = {
  id: string;
  client_id: string | null;
  code: string;
  reward_number: number | null;
  reward_type: string | null;
  status: string | null;
  issued_at: string | null;
  redeemed_at?: string | null;
  client_name?: string | null;
  client_email?: string | null;
};

export function RewardCodePanel() {
  const supabase = createClient();
  const [code, setCode] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function checkCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setResult(null);
    const clean = code.trim().toUpperCase();
    if (!clean) {
      setMessage("Introdu codul voucherului.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("client_rewards")
      .select("id,client_id,code,reward_number,reward_type,status,issued_at,redeemed_at")
      .eq("code", clean)
      .maybeSingle();

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }
    if (!data) {
      setMessage("Cod invalid. Nu există voucher cu acest cod.");
      setLoading(false);
      return;
    }

    let client_name: string | null = null;
    let client_email: string | null = null;
    if (data.client_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name,email")
        .eq("id", data.client_id)
        .maybeSingle();
      client_name = profile?.full_name || null;
      client_email = profile?.email || null;
    }

    setResult({ ...(data as Result), client_name, client_email });
    setLoading(false);
  }

  async function redeem() {
    if (!result) return;
    setLoading(true);
    const { error } = await supabase
      .from("client_rewards")
      .update({ status: "redeemed", redeemed_at: new Date().toISOString() })
      .eq("id", result.id);
    if (error) setMessage(error.message);
    else {
      setMessage("Voucher marcat ca folosit.");
      setResult({ ...result, status: "redeemed", redeemed_at: new Date().toISOString() });
    }
    setLoading(false);
  }

  const isValid = result && result.status !== "redeemed";

  return (
    <section className="lux-panel rounded-[2.4rem] p-6 md:p-8">
      <p className="lux-label">Verificare voucher</p>
      <h2 className="editorial-title mt-3 text-4xl md:text-5xl">Verifică voucherul clientei</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
        Introdu codul de pe cardul PNG. Dacă este valid, îl poți marca drept folosit după programare.
      </p>
      <form onSubmit={checkCode} className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]">
        <input className="lux-input uppercase tracking-[0.18em]" placeholder="NB-2026-ABCD" value={code} onChange={(event) => setCode(event.target.value)} />
        <button disabled={loading} className="lux-action lux-action-soft rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-50">
          <Search className="mr-2 inline h-4 w-4" /> Verifică
        </button>
      </form>
      {message && <p className="mt-4 text-sm text-[var(--rose-strong)]">{message}</p>}
      {result && (
        <article className="mt-6 rounded-[2rem] border border-[var(--line)] bg-[var(--panel)] p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="lux-label">{result.reward_type || "Reward"}</p>
              <h3 className="mt-2 font-serif text-4xl">{result.code}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{result.client_name || result.client_email || "Clientă"} · Reward #{result.reward_number || "—"}</p>
              <p className="mt-2 text-sm text-[var(--muted)]">Status: {result.status || "active"}</p>
            </div>
            <div className={isValid ? "status-pill status-available mt-0" : "status-pill status-full mt-0"}>
              {isValid ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {isValid ? "Valid" : "Folosit / invalid"}
            </div>
          </div>
          {isValid && <button onClick={redeem} disabled={loading} className="mt-5 rounded-full border border-[var(--line)] px-5 py-3 text-sm font-semibold hover:bg-[var(--panel-strong)] disabled:opacity-50">Marchează folosit</button>}
        </article>
      )}
    </section>
  );
}
