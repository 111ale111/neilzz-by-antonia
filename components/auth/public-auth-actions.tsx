"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Role = "loading" | "guest" | "client" | "admin";

const ghostButton = "inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--panel)] px-5 py-3 text-sm font-semibold text-[var(--text)] backdrop-blur-xl transition hover:bg-[var(--panel-strong)]";
const creamButton = "neilzz-register-pill inline-flex min-h-10 min-w-[116px] items-center justify-center rounded-full border px-4 py-2 text-sm font-extrabold transition hover:opacity-90";
const logoutButton = "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#d9a0b1]/40 bg-[#d9a0b1]/10 px-5 py-3 text-sm font-semibold text-[#f3c5d2] transition hover:bg-[#d9a0b1]/15";

function adminEmails() {
  return (process.env.NEXT_PUBLIC_ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function PublicAuthActions() {
  const [role, setRole] = useState<Role>("loading");

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    async function load() {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!active) return;

      if (!user) {
        setRole("guest");
        return;
      }

      let { data: profile } = await supabase.from("profiles").select("role,email").eq("id", user.id).maybeSingle();
      if (!profile && user.email) {
        const retry = await supabase.from("profiles").select("role,email").ilike("email", user.email).maybeSingle();
        profile = retry.data;
      }
      const metaRole = typeof user.user_metadata?.role === "string" ? user.user_metadata.role : "";
      const isAdmin = profile?.role === "admin" || metaRole === "admin" || adminEmails().includes((user.email || profile?.email || "").toLowerCase());
      setRole(isAdmin ? "admin" : "client");
    }

    load();
    const { data } = supabase.auth.onAuthStateChange(() => load());

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  if (role === "loading") return null;

  if (role === "admin") {
    return (
      <div className="hidden items-center gap-3 sm:flex">
        <Link href="/dashboard" className={ghostButton}>Dashboard</Link>
        <Link href="/account" className={ghostButton}>Account</Link>
        <a href="/auth/logout" className={logoutButton}><LogOut className="h-4 w-4" /> Logout</a>
      </div>
    );
  }

  if (role === "client") {
    return (
      <div className="hidden items-center gap-3 sm:flex">
        <Link href="/account" className={ghostButton}>Account</Link>
        <a href="/auth/logout" className={logoutButton}><LogOut className="h-4 w-4" /> Logout</a>
      </div>
    );
  }

  return (
    <div className="hidden items-center gap-3 sm:flex">
      <Link href="/login" className={ghostButton}>Login</Link>
      <Link href="/register" className={creamButton}>Register</Link>
    </div>
  );
}
