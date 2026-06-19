"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/account` });
    setLoading(false);
    setMessage(error ? error.message : "Email de resetare trimis. Verifică inbox-ul.");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--bg)] px-5 py-12 text-[var(--text)]">
      <div className="lux-noise" />
      <div className="relative z-10 w-full max-w-md">
        <Link href="/login" className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm text-[var(--muted)]"><ArrowLeft className="h-4 w-4" /> Login</Link>
        <form onSubmit={sendReset} className="lux-panel rounded-[2.4rem] p-7 md:p-8">
          <div className="mb-7 grid h-14 w-14 place-items-center rounded-full border border-[var(--line)] bg-[var(--panel-strong)] text-[var(--rose-strong)]"><KeyRound className="h-6 w-6" /></div>
          <p className="lux-label">Security</p>
          <h1 className="editorial-title mt-4 text-5xl leading-[0.9]">Reset password</h1>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">Introdu emailul contului. Vei primi un link de resetare.</p>
          <input className="lux-input mt-7" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          {message && <p className="mt-4 text-sm text-[var(--muted)]">{message}</p>}
          <button className="lux-action lux-action-soft mt-7 inline-flex w-full items-center justify-center rounded-full px-5 py-3.5 text-sm font-semibold" disabled={loading}>{loading ? "Sending..." : "Send reset email"}</button>
        </form>
      </div>
    </main>
  );
}
