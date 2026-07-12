"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/client";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Galerie" },
  { href: "/servicii-preturi", label: "Servicii & Prețuri" },
  { href: "/reviews", label: "Review-uri" },
  { href: "/booking", label: "Programare" },
  { href: "/about", label: "Despre" },
];

type HeaderRole = "loading" | "guest" | "client" | "admin";

function adminEmails() {
  return (process.env.NEXT_PUBLIC_ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function SiteHeader() {
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 80], [0.72, 1]);
  const [role, setRole] = React.useState<HeaderRole>("loading");
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [logoUrl, setLogoUrl] = React.useState("/neilzz-logo-light.png");

  React.useEffect(() => {
    let active = true;
    const supabase = createClient();

    async function loadAuthState() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) return;

      if (!user) {
        setRole("guest");
        return;
      }

      let { data: profile } = await supabase
        .from("profiles")
        .select("role,email")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile && user.email) {
        const retry = await supabase
          .from("profiles")
          .select("role,email")
          .ilike("email", user.email)
          .maybeSingle();
        profile = retry.data;
      }

      if (!active) return;
      const metadataRole = typeof user.user_metadata?.role === "string" ? user.user_metadata.role.toLowerCase() : "";
      const email = (user.email || profile?.email || "").toLowerCase();
      const isAdmin = profile?.role === "admin" || metadataRole === "admin" || adminEmails().includes(email);
      setRole(isAdmin ? "admin" : "client");
    }

    loadAuthState();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(loadAuthState, 0);
    });

    const onFocus = () => loadAuthState();
    window.addEventListener("focus", onFocus);

    return () => {
      active = false;
      window.removeEventListener("focus", onFocus);
      listener.subscription.unsubscribe();
    };
  }, []);


  // Blochează scroll-ul paginii când drawer-ul mobil este deschis.
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = mobileMenuOpen ? "hidden" : prev || "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  React.useEffect(() => {
    let active = true;
    const supabase = createClient();
    async function loadBrandAssets() {
      const { data } = await supabase.from("site_settings").select("value").eq("key", "brand_assets").maybeSingle();
      const value = data?.value as { logoUrl?: string } | null;
      if (active && value?.logoUrl) setLogoUrl(value.logoUrl);
    }
    loadBrandAssets();
    return () => { active = false; };
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <motion.div
        style={{ opacity: headerOpacity }}
        className="absolute inset-0 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_78%,transparent)] backdrop-blur-2xl"
        aria-hidden="true"
      />
      <div className="relative mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 py-4 md:px-8 md:py-5">
        <Link href="/" className="flex shrink-0 items-center">
          <img
            src={logoUrl}
            alt="neilzzbyanto"
            className="h-11 w-auto object-contain drop-shadow-[0_0_20px_rgba(247,192,207,0.24)] md:h-14"
          />
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-[var(--muted)] lg:gap-7 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-[var(--text)]">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--panel)] text-[var(--text)] backdrop-blur-xl md:hidden"
            aria-label="Deschide meniul"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          {role === "guest" && (
            <>
              <Link href="/login" className="hidden items-center justify-center rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--panel-strong)] sm:inline-flex">Login</Link>
              <Link href="/register" className="neilzz-register-pill hidden min-w-[116px] items-center justify-center rounded-full border px-5 py-2 text-sm font-extrabold shadow-[0_0_22px_rgba(255,242,234,0.16)] transition hover:opacity-90 sm:inline-flex"><span>Register</span></Link>
            </>
          )}

          {role === "client" && (
            <>
              <Link href="/account" className="hidden items-center justify-center rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--panel-strong)] sm:inline-flex">Account</Link>
              <a href="/auth/logout" className="hidden items-center justify-center rounded-full border border-[#d9a0b1]/40 bg-[#d9a0b1]/10 px-4 py-2 text-sm font-semibold text-[#f3c5d2] transition hover:bg-[#d9a0b1]/15 sm:inline-flex">Logout</a>
            </>
          )}

          {role === "admin" && (
            <>
              <Link href="/dashboard" className="hidden items-center justify-center rounded-full border border-[#d9a0b1]/40 bg-[#d9a0b1]/10 px-4 py-2 text-sm font-semibold text-[#f3c5d2] transition hover:bg-[#d9a0b1]/15 sm:inline-flex">Dashboard</Link>
              <Link href="/account" className="hidden items-center justify-center rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--panel-strong)] lg:inline-flex">Account</Link>
              <a href="/auth/logout" className="hidden items-center justify-center rounded-full border border-[#d9a0b1]/40 bg-[#d9a0b1]/10 px-4 py-2 text-sm font-semibold text-[#f3c5d2] transition hover:bg-[#d9a0b1]/15 sm:inline-flex">Logout</a>
            </>
          )}
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="relative mx-auto mt-1 w-[calc(100%-1.5rem)] max-w-md overflow-hidden rounded-[1.7rem] border border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_92%,transparent)] p-3 shadow-[0_28px_90px_rgba(0,0,0,.55)] backdrop-blur-2xl md:hidden">
          <div className="grid gap-2 text-sm">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className="rounded-2xl px-4 py-3 text-[var(--muted)] transition hover:bg-[var(--panel)] hover:text-[var(--text)]">
                {link.label}
              </Link>
            ))}
            <div className="my-1 h-px bg-[var(--line)]" />
            {role === "admin" ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="rounded-2xl px-4 py-3 font-semibold text-[var(--rose-strong)]">Dashboard</Link>
                <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="rounded-2xl px-4 py-3 text-[var(--text)]">Account</Link>
                <a href="/auth/logout" className="rounded-2xl px-4 py-3 font-semibold text-[var(--rose-strong)]">Logout</a>
              </>
            ) : role === "client" ? (
              <>
                <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="rounded-2xl px-4 py-3 font-semibold text-[var(--text)]">Account</Link>
                <a href="/auth/logout" className="rounded-2xl px-4 py-3 font-semibold text-[var(--rose-strong)]">Logout</a>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-center font-semibold text-[var(--text)]">Login</Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="neilzz-register-pill rounded-full px-4 py-3 text-center font-extrabold">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}

    </header>
  );
}
