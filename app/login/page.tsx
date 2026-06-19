"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Apple, Eye, EyeOff, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const OAUTH_ENABLED = process.env.NEXT_PUBLIC_ENABLE_OAUTH_PROVIDERS === "true";

function adminEmails() {
  return (process.env.NEXT_PUBLIC_ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function getNextPath() {
    if (typeof window === "undefined") return "/account";
    const next = new URLSearchParams(window.location.search).get("next");
    return next && next.startsWith("/") ? next : "/account";
  }

  async function ensureProfile(userId: string, userEmail?: string | null, metadata?: Record<string, unknown>) {
    const fallbackName =
      (typeof metadata?.full_name === "string" && metadata.full_name) ||
      (typeof metadata?.name === "string" && metadata.name) ||
      userEmail?.split("@")[0] ||
      "Clientă";
    const roleFromMeta = typeof metadata?.role === "string" ? metadata.role : "";
    const fallbackRole = roleFromMeta === "admin" || adminEmails().includes((userEmail || "").toLowerCase()) ? "admin" : "client";

    let { data: profile } = await supabase.from("profiles").select("role,email,full_name").eq("id", userId).maybeSingle();
    if (!profile && userEmail) {
      const retry = await supabase.from("profiles").select("role,email,full_name").ilike("email", userEmail).maybeSingle();
      profile = retry.data;
    }

    if (!profile) {
      await supabase.from("profiles").upsert(
        {
          id: userId,
          email: userEmail,
          full_name: fallbackName,
          role: fallbackRole,
          is_activated: fallbackRole === "admin",
          visit_count: 0,
          loyalty_goal: 5,
        },
        { onConflict: "id" },
      );
      return fallbackRole;
    }

    const update: Record<string, string | boolean | null> = {};
    if (!profile.email && userEmail) update.email = userEmail;
    if (!profile.full_name) update.full_name = fallbackName;
    if (fallbackRole === "admin" && profile.role !== "admin") {
      update.role = "admin";
      update.is_activated = true;
    }
    if (Object.keys(update).length > 0) await supabase.from("profiles").update(update).eq("id", userId);
    return update.role === "admin" ? "admin" : profile.role || fallbackRole;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) {
      setLoading(false);
      setError(loginError.message);
      return;
    }

    const user = data.user;
    if (user) {
      const role = await ensureProfile(user.id, user.email, user.user_metadata);
      setLoading(false);
      router.push(role === "admin" ? "/dashboard" : getNextPath());
      router.refresh();
      return;
    }

    setLoading(false);
    router.push(getNextPath());
    router.refresh();
  }

  async function loginWithProvider(provider: "google" | "apple") {
    setError("");
    const next = getNextPath();
    const { error: providerError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
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
        <div className="soft-pulse absolute left-[12%] top-[10%] h-80 w-80 rounded-full bg-[var(--wine)]/42 blur-[130px]" />
        <div className="soft-pulse absolute right-[10%] bottom-[12%] h-80 w-80 rounded-full bg-[var(--rose)]/12 blur-[140px]" />
      </div>
      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm text-[var(--muted)] backdrop-blur-xl transition hover:text-[var(--text)]">
          <ArrowLeft className="h-4 w-4" /> Acasă
        </Link>
        <form onSubmit={handleLogin} className="lux-panel rounded-[2.4rem] p-7 md:p-8">
          <div className="mb-7 grid h-14 w-14 place-items-center rounded-full border border-[var(--line)] bg-[var(--panel-strong)] text-[var(--rose-strong)]"><LogIn className="h-6 w-6" /></div>
          <p className="lux-label">Acces privat</p>
          <h1 className="editorial-title mt-4 text-5xl leading-[0.9]">Login</h1>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">Intră în contul tău neilzzbyanto. Adminul intră automat în dashboard.</p>

          <div className="space-y-4">
            <input className="lux-input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <div className="flex gap-2">
              <input className="lux-input" type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPassword((value) => !value)} className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 text-[var(--muted)]">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {error && <p className="mt-4 rounded-2xl border border-red-300/20 bg-red-300/10 px-4 py-3 text-sm text-red-200">{error}</p>}
          <button className="lux-action lux-action-soft mt-7 inline-flex w-full items-center justify-center rounded-full px-5 py-3.5 text-sm font-semibold" type="submit" disabled={loading}>{loading ? "Se conectează..." : "Login"}</button>
          <p className="mt-5 text-center text-sm text-[var(--muted)]">Nu ai cont? <Link href="/register" className="text-[var(--rose-strong)]">Creează cont</Link><br /><Link href="/forgot-password" className="text-[var(--rose-strong)]">Ai uitat parola?</Link></p>
        </form>
      </div>
    </main>
  );
}
