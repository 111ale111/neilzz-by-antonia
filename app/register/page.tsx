"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Apple, CheckCircle2, Eye, EyeOff, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const OAUTH_ENABLED = process.env.NEXT_PUBLIC_ENABLE_OAUTH_PROVIDERS === "true";

export default function RegisterPage() {
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/account`,
      },
    });

    if (signupError) {
      setLoading(false);
      setError(signupError.message);
      return;
    }

    const userId = data.user?.id;
    if (userId) {
      await supabase.from("profiles").upsert(
        {
          id: userId,
          email,
          full_name: fullName.trim() || email.split("@")[0],
          role: "client",
          is_activated: false,
          visit_count: 0,
          loyalty_goal: 5,
        },
        { onConflict: "id" },
      );
    }

    setLoading(false);
    setMessage("Cont creat. Verifică emailul dacă Supabase cere confirmare, apoi intră în cont.");
    setFullName("");
    setEmail("");
    setPassword("");
  }

  async function registerWithProvider(provider: "google" | "apple") {
    setError("");
    const { error: providerError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/account` },
    });
    if (providerError) {
      const label = provider === "google" ? "Google" : "Apple";
      if (providerError.message.toLowerCase().includes("unsupported provider") || providerError.message.toLowerCase().includes("not enabled")) {
        setError(`${label} nu este activat încă în Supabase → Authentication → Providers.`);
      } else {
        setError(providerError.message);
      }
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--bg)] px-5 py-12 text-[var(--text)]">
      <div className="lux-noise" />
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="soft-pulse absolute left-[10%] top-[10%] h-80 w-80 rounded-full bg-[var(--wine)]/42 blur-[130px]" />
        <div className="soft-pulse absolute right-[12%] bottom-[14%] h-80 w-80 rounded-full bg-[var(--rose)]/12 blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm text-[var(--muted)] backdrop-blur-xl transition hover:text-[var(--text)]">
          <ArrowLeft className="h-4 w-4" /> Acasă
        </Link>

        <form onSubmit={handleRegister} className="lux-panel rounded-[2.4rem] p-7 md:p-8">
          <div className="mb-7 grid h-14 w-14 place-items-center rounded-full border border-[var(--line)] bg-[var(--panel-strong)] text-[var(--rose-strong)]">
            <UserRound className="h-6 w-6" />
          </div>

          <p className="lux-label">Cont client</p>
          <h1 className="editorial-title mt-4 text-5xl leading-[0.9]">Creează cont</h1>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
            Creezi contul acum. Activarea pentru review se face ulterior cu codul privat primit de la Antonia.
          </p>

          <div className="space-y-4">
            <input className="lux-input" placeholder="Nume complet" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <input className="lux-input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <div className="flex gap-2">
              <input className="lux-input" type={showPassword ? "text" : "password"} placeholder="Parolă, minimum 6 caractere" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPassword((value) => !value)} className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 text-[var(--muted)]">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
          </div>

          {error && <p className="mt-4 rounded-2xl border border-red-300/20 bg-red-300/10 px-4 py-3 text-sm text-red-200">{error}</p>}
          {message && <p className="mt-4 flex items-center gap-2 text-sm text-emerald-300"><CheckCircle2 className="h-4 w-4" /> {message}</p>}

          <button className="lux-action lux-action-soft mt-7 inline-flex w-full items-center justify-center rounded-full px-5 py-3.5 text-sm font-semibold" type="submit" disabled={loading}>
            {loading ? "Se creează..." : "Creează cont"}
          </button>

          <p className="mt-5 text-center text-sm text-[var(--muted)]">
            Ai deja cont? <Link href="/login" className="text-[var(--rose-strong)]">Login</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
