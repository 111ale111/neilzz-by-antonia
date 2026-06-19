"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, CalendarDays, Camera, CheckCircle2, Images, Moon, ShieldCheck, Sparkles, Star, Sun, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { PrivateAccessLink } from "@/components/auth/private-access-link";

const INSTAGRAM_URL = "https://instagram.com/neilzz_by.anto";

const defaultHomepageContent: HomepageContent = {
  badge: "Private nail atelier",
  titleLine1: "Quiet luxury.",
  titleLine2: "Perfect finish.",
  subtitle: "Forme curate, detalii fine și un finish premium — gândit ca o experiență privată, nu ca un template.",
  primaryCta: "Vezi galeria",
  secondaryCta: "Programează-te",
  instagramHandle: "@neilzz_by.anto",
  instagramUrl: INSTAGRAM_URL,
};

type GalerieImage = {
  id: string;
  title: string | null;
  image_url: string;
};

type BookingDay = {
  id: string;
  date_label: string;
  day_label: string | null;
  status: string;
  note: string | null;
  position: number | null;
};

type SiteSettings = {
  featuredClient?: boolean;
  featuredDesign?: boolean;
  featuredReview?: boolean;
  publicBookingEnabled?: boolean;
  appStatus?: string;
};

type HomepageContent = {
  badge: string;
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
  instagramHandle: string;
  instagramUrl: string;
};

type PublicReview = {
  id: string;
  name: string | null;
  rating: number | null;
  text: string;
  is_featured?: boolean | null;
  photo_url?: string | null;
};

type FeaturedClient = {
  id: string;
  full_name: string | null;
  visit_count: number | null;
  avatar_url: string | null;
};

const fallbackGalerie: GalerieImage[] = [
  { id: "fallback-1", title: "Signature Finish", image_url: "https://picsum.photos/seed/neilzz-v44-1/1300/1700" },
  { id: "fallback-2", title: "Soft Detail", image_url: "https://picsum.photos/seed/neilzz-v44-2/1300/1700" },
  { id: "fallback-3", title: "Gloss Set", image_url: "https://picsum.photos/seed/neilzz-v44-3/1300/1700" },
  { id: "fallback-4", title: "Clean Shape", image_url: "https://picsum.photos/seed/neilzz-v44-4/1300/1700" },
];

const fallbackBooking: BookingDay[] = [
  { id: "b1", date_label: "23 martie", day_label: "Luni", status: "full", note: "Full", position: 1 },
  { id: "b2", date_label: "24 martie", day_label: "Marți", status: "available", note: "1 loc liber", position: 2 },
  { id: "b3", date_label: "25 martie", day_label: "Miercuri", status: "limited", note: "Locuri limitate", position: 3 },
];

const reviewPreview: PublicReview[] = [
  { id: "fallback-review-1", name: "Clientă", rating: 5, text: "Finish curat, elegant și foarte atent lucrat.", is_featured: true },
  { id: "fallback-review-2", name: "Clientă verificată", rating: 5, text: "Exact vibe-ul pe care îl voiam: feminin, premium și rezistent.", is_featured: true },
  { id: "fallback-review-3", name: "Clientă", rating: 5, text: "Se vede atenția la fiecare detaliu.", is_featured: true },
];

function statusLabel(status: string, note?: string | null) {
  if (note) return note;
  if (status === "full") return "Full";
  if (status === "vacation") return "Concediu";
  if (status === "limited") return "Locuri limitate";
  return "Disponibil";
}

function displayDateLabel(dateLabel: string) {
  const clean = dateLabel.trim();
  if (/^\d{1,2}$/.test(clean)) return `${clean} iulie`;
  return clean;
}

function statusClass(status: string) {
  if (status === "full") return "status-pill status-full";
  if (status === "vacation") return "status-pill status-vacation";
  if (status === "limited") return "status-pill status-limited";
  return "status-pill status-available";
}

function statusDotClass(status: string) {
  if (status === "full") return "bg-red-300 shadow-[0_0_22px_rgba(252,165,165,.78)]";
  if (status === "vacation") return "bg-amber-300 shadow-[0_0_22px_rgba(252,211,77,.72)]";
  if (status === "limited") return "bg-yellow-300 shadow-[0_0_22px_rgba(253,224,71,.72)]";
  return "bg-emerald-300 shadow-[0_0_22px_rgba(110,231,183,.74)]";
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, filter: "blur(12px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-90px" }}
      transition={{ duration: 0.82, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function LuxuryButton({ href, children, solid = false }: { href: string; children: React.ReactNode; solid?: boolean }) {
  return (
    <motion.a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      whileHover={{ y: -3, scale: 1.018 }}
      whileTap={{ scale: 0.98 }}
      className={
        solid
          ? "lux-action lux-action-soft group inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition md:px-6 md:py-3.5"
          : "lux-action group inline-flex items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel)] px-5 py-3 text-sm font-semibold text-[var(--text)] backdrop-blur-xl transition hover:bg-[var(--panel-strong)] md:px-6 md:py-3.5"
      }
    >
      {children}
      <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </motion.a>
  );
}

function ThemeToggle() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const saved = window.localStorage.getItem("neilzz-theme") || "dark";
    setTheme(saved);
    document.documentElement.dataset.theme = saved;
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("neilzz-theme", next);
  }

  return (
    <button
      onClick={toggleTheme}
      className="rounded-full border border-[var(--line)] bg-[var(--panel)] p-3 text-[var(--text)] backdrop-blur-xl transition hover:bg-[var(--panel-strong)]"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}


type MobileRole = "loading" | "guest" | "client" | "admin";

function MobileBottomNav({ instagramUrl }: { instagramUrl: string }) {
  const [role, setRole] = useState<MobileRole>("loading");

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    async function loadRole() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

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

      const adminList = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "")
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);
      const metaRole = typeof user.user_metadata?.role === "string" ? user.user_metadata.role.toLowerCase() : "";
      const email = (user.email || profile?.email || "").toLowerCase();
      const isAdmin = profile?.role === "admin" || metaRole === "admin" || adminList.includes(email);
      setRole(isAdmin ? "admin" : "client");
    }

    loadRole();
    const { data } = supabase.auth.onAuthStateChange(() => window.setTimeout(loadRole, 0));
    const onFocus = () => loadRole();
    window.addEventListener("focus", onFocus);

    return () => {
      active = false;
      data.subscription.unsubscribe();
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const baseClass = "rounded-full px-2 py-2 text-center transition active:scale-95";
  const mutedClass = `${baseClass} text-[var(--muted)]`;
  const strongClass = `${baseClass} font-semibold text-[var(--text)]`;

  return (
    <nav className="neilzz-mobile-nav fixed bottom-[calc(.85rem+env(safe-area-inset-bottom))] left-1/2 z-50 grid w-[calc(100%-1.25rem)] max-w-md -translate-x-1/2 grid-cols-5 items-center rounded-full border border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_84%,transparent)] px-2 py-2 text-[11px] font-medium shadow-[0_20px_80px_rgba(0,0,0,.45)] backdrop-blur-2xl md:hidden">
      {role === "admin" ? (
        <>
          <Link href="/" className={mutedClass}>Home</Link>
          <Link href="/gallery" className={mutedClass}>Galerie</Link>
          <Link href="/dashboard" className={strongClass}>Dashboard</Link>
          <Link href="/account" className={mutedClass}>Account</Link>
          <a href="/auth/logout" className={strongClass}>Logout</a>
        </>
      ) : role === "client" ? (
        <>
          <Link href="/" className={mutedClass}>Home</Link>
          <Link href="/gallery" className={mutedClass}>Galerie</Link>
          <Link href="/booking" className={mutedClass}>Booking</Link>
          <Link href="/account" className={strongClass}>Account</Link>
          <a href="/auth/logout" className={strongClass}>Logout</a>
        </>
      ) : (
        <>
          <Link href="/" className={mutedClass}>Home</Link>
          <Link href="/gallery" className={mutedClass}>Galerie</Link>
          <Link href="/booking" className={mutedClass}>Booking</Link>
          <Link href="/login" className={strongClass}>Login</Link>
          <Link href="/register" className="neilzz-register-pill rounded-full px-2 py-2 text-center text-[11px] font-extrabold transition active:scale-95">Register</Link>
        </>
      )}
    </nav>
  );
}

function SparkleField() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <span className="sparkle left-[12%] top-[19%]" />
      <span className="sparkle left-[39%] top-[34%] [animation-delay:1.4s]" />
      <span className="sparkle right-[18%] top-[27%] [animation-delay:2.3s]" />
      <span className="sparkle bottom-[28%] left-[45%] [animation-delay:3.2s]" />
      <span className="sparkle bottom-[18%] right-[13%] [animation-delay:4.1s]" />
      <span className="sparkle right-[34%] bottom-[38%] [animation-delay:5.2s]" />
    </div>
  );
}

export default function Home() {
  const [gallery, setGalerie] = useState<GalerieImage[]>([]);
  const [bookingDays, setBookingDays] = useState<BookingDay[]>(fallbackBooking);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({ featuredClient: false, featuredDesign: true, featuredReview: true, publicBookingEnabled: true, appStatus: "active" });
  const [homepageContent, setHomepageContent] = useState<HomepageContent>(defaultHomepageContent);
  const [featuredReviews, setFeaturedReviews] = useState<PublicReview[]>([]);
  const [featuredClient, setFeaturedClient] = useState<FeaturedClient | null>(null);

  const { scrollYProgress } = useScroll();
  const heroLift = useTransform(scrollYProgress, [0, 0.34], [0, -70]);
  const imageScale = useTransform(scrollYProgress, [0, 0.34], [1, 1.045]);
  const veilOpacity = useTransform(scrollYProgress, [0, 0.24], [0.08, 0.42]);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();

      const { data: galleryData } = await supabase
        .from("gallery_images")
        .select("id,title,image_url")
        .eq("is_visible", true)
        .order("created_at", { ascending: false })
        .limit(8);

      if (galleryData && galleryData.length > 0) setGalerie(galleryData);

      const { data: bookingData } = await supabase
        .from("booking_days")
        .select("id,date_label,day_label,status,note,position")
        .eq("is_visible", true)
        .order("position", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(5);

      if (bookingData && bookingData.length > 0) setBookingDays(bookingData);

      const [{ data: settingsData }, { data: contentData }] = await Promise.all([
        supabase.from("site_settings").select("value").eq("key", "homepage_features").maybeSingle(),
        supabase.from("site_settings").select("value").eq("key", "homepage_content").maybeSingle(),
      ]);

      if (settingsData?.value && typeof settingsData.value === "object") {
        setSiteSettings((current) => ({ ...current, ...(settingsData.value as SiteSettings) }));
      }

      if (contentData?.value && typeof contentData.value === "object") {
        setHomepageContent((current) => ({ ...current, ...(contentData.value as HomepageContent) }));
      }

      const { data: featuredReviewData } = await supabase
        .from("reviews")
        .select("id,name,rating,text,is_featured,photo_url")
        .eq("is_approved", true)
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(3);

      if (featuredReviewData && featuredReviewData.length > 0) {
        setFeaturedReviews(featuredReviewData as PublicReview[]);
      } else {
        const { data: approvedReviewData } = await supabase
          .from("reviews")
          .select("id,name,rating,text,is_featured,photo_url")
          .eq("is_approved", true)
          .order("created_at", { ascending: false })
          .limit(3);
        if (approvedReviewData && approvedReviewData.length > 0) setFeaturedReviews(approvedReviewData as PublicReview[]);
      }

      const { data: clientData } = await supabase
        .from("profiles")
        .select("id,full_name,visit_count,avatar_url")
        .eq("role", "client")
        .eq("is_activated", true)
        .order("visit_count", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (clientData) setFeaturedClient(clientData as FeaturedClient);
    }

    loadData();
  }, []);

  const images = useMemo(() => (gallery.length > 0 ? gallery : fallbackGalerie), [gallery]);
  const nextBooking = bookingDays[0] || fallbackBooking[0];
  const reviewCards = featuredReviews.length > 0 ? featuredReviews : reviewPreview;

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[var(--bg)] text-[var(--text)]">
      <div className="lux-noise" />

      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="soft-pulse absolute left-[8%] top-[7%] h-[24rem] w-[24rem] rounded-full bg-[var(--wine)]/42 blur-[140px]" />
        <div className="soft-pulse absolute right-[4%] top-[16%] h-[22rem] w-[22rem] rounded-full bg-[var(--rose)]/14 blur-[125px]" />
        <div className="absolute inset-x-0 top-0 h-px rose-line" />
      </div>

      <SiteHeader />

      <section className="relative z-10 min-h-[100svh] overflow-visible px-5 pb-32 pt-[8.75rem] md:min-h-screen md:px-8 md:pb-0 md:pt-28">
        <SparkleField />
        <div className="mx-auto grid min-h-0 max-w-[1500px] items-start gap-10 md:min-h-[calc(100vh-6rem)] md:items-center lg:grid-cols-[0.82fr_1.18fr]">
          <motion.div className="relative z-10 max-w-3xl pt-0 lg:pt-0 lg:[transform:var(--hero-lift)]">
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.35 }}
              className="inline-flex rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-[0.62rem] font-bold uppercase tracking-[0.38em] text-[var(--rose-strong)] backdrop-blur-xl"
            >
              {homepageContent.badge}
            </motion.div>

            <motion.h1
              initial={false}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="editorial-title mt-7 max-w-3xl text-[3.65rem] leading-[0.88] sm:text-[4.05rem] lg:text-[4.75rem] xl:text-[5.25rem]"
            >
              {homepageContent.titleLine1}
              <br />
              {homepageContent.titleLine2}
            </motion.h1>

            <motion.p
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mt-7 max-w-lg text-base leading-8 text-[var(--muted)] md:text-[1.05rem] md:leading-9"
            >
              {homepageContent.subtitle}
            </motion.p>

            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <LuxuryButton href="/gallery" solid>
                <Images className="h-4 w-4" />
                {homepageContent.primaryCta}
              </LuxuryButton>
              <LuxuryButton href={homepageContent.instagramUrl || INSTAGRAM_URL}>
                <CalendarDays className="h-4 w-4" />
                {homepageContent.secondaryCta}
              </LuxuryButton>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 54, filter: "blur(18px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.05, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden min-h-[430px] pb-8 sm:min-h-[580px] lg:block lg:min-h-[650px]"
          >
            <div className="absolute inset-0 rounded-[3rem] bg-[var(--rose)]/10 blur-[110px]" />
            <div className="ribbon absolute -left-12 top-12 h-20 w-[120%] rounded-full bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--rose)_20%,transparent),transparent)] blur-2xl" />

            <motion.div
              style={{ scale: imageScale }}
              className="absolute left-[2%] top-[3%] w-[69%] overflow-hidden rounded-[2.2rem] border border-[var(--line)] bg-[var(--panel)] p-2.5 shadow-[0_45px_130px_var(--shadow)] backdrop-blur-2xl sm:p-3"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.65rem] bg-[#10060b]">
                <Image
                  src={images[0].image_url}
                  alt={images[0].title || "neilzzbyanto"}
                  fill
                  priority
                  sizes="(min-width: 1024px) 38vw, 82vw"
                  className="object-cover opacity-90 saturate-[0.92]"
                />
                <motion.div style={{ opacity: veilOpacity }} className="absolute inset-0 bg-black" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/16 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 md:bottom-7 md:left-7">
                  <p className="text-[0.58rem] uppercase tracking-[0.45em] text-white/48">signature</p>
                  <p className="mt-2 font-serif text-3xl text-white md:text-5xl">{images[0].title || "Private finish"}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-[1%] top-[20%] w-[43%] overflow-hidden rounded-[1.8rem] border border-[var(--line)] bg-[var(--panel)] p-2.5 shadow-[0_35px_110px_var(--shadow)] backdrop-blur-2xl sm:p-3"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-[1.35rem] bg-[#10060b]">
                <Image
                  src={images[1]?.image_url || images[0].image_url}
                  alt={images[1]?.title || "neilzzbyanto"}
                  fill
                  sizes="(min-width: 1024px) 25vw, 62vw"
                  className="object-cover opacity-86 saturate-[0.92]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-[1%] left-[31%] w-[56%] overflow-hidden rounded-[1.8rem] border border-[var(--line)] bg-[var(--panel)] p-2.5 shadow-[0_35px_110px_var(--shadow)] backdrop-blur-2xl sm:p-3"
            >
              <div className="relative aspect-[5/3] overflow-hidden rounded-[1.35rem] bg-[#10060b]">
                <Image
                  src={images[2]?.image_url || images[0].image_url}
                  alt={images[2]?.title || "neilzzbyanto"}
                  fill
                  sizes="(min-width: 1024px) 30vw, 75vw"
                  className="object-cover opacity-86 saturate-[0.92]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/42 to-transparent" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {siteSettings.publicBookingEnabled !== false && (
      <section className="relative z-10 px-5 pb-12 pt-16 md:px-8 md:pb-20 md:pt-24">
        <Reveal>
          <div className="lux-panel mx-auto max-w-[1320px] rounded-[1.8rem] p-5 md:rounded-[2.2rem] md:p-8">
            <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
              <div className="flex items-start gap-4 md:gap-5">
                <span className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${statusDotClass(nextBooking.status)}`} />
                <div>
                  <p className="lux-label">Next booking window</p>
                  <div className="mt-5 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:gap-10">
                    <h2 className="font-serif text-4xl leading-none tracking-[-0.02em] md:text-5xl">
                      {displayDateLabel(nextBooking.date_label)}
                    </h2>
                    <span className={statusClass(nextBooking.status)}>
                      {statusLabel(nextBooking.status, nextBooking.note)}
                    </span>
                  </div>
                </div>
              </div>
              {nextBooking.status === "vacation" ? (
                <div className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-5 py-2.5 text-sm font-semibold text-[var(--muted)] md:justify-self-end">
                  Booking unavailable
                </div>
              ) : (
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel)] px-5 py-2.5 text-sm font-semibold transition hover:bg-[var(--panel-strong)] md:justify-self-end">
                  Request slot <ArrowUpRight className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </Reveal>
      </section>
      )}

      {siteSettings.featuredClient && featuredClient && (
      <section className="relative z-10 px-5 py-10 md:px-8 md:py-12">
        <Reveal>
          <div className="lux-panel mx-auto max-w-[1320px] rounded-[2.4rem] p-7 md:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-5">
                <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full border border-[var(--line)] bg-[var(--panel-strong)] text-2xl font-semibold text-[var(--rose-strong)]">
                  {featuredClient.avatar_url ? <img src={featuredClient.avatar_url} alt="Featured client" className="h-full w-full object-cover" /> : <UserRound className="h-8 w-8" />}
                </div>
                <div>
                  <p className="lux-label">Featured client</p>
                  <h2 className="mt-2 font-serif text-4xl">{featuredClient.full_name || "Clientă"}</h2>
                  <p className="mt-2 text-sm text-[var(--muted)]">{featuredClient.visit_count || 0} vizite · cont verificat</p>
                </div>
              </div>
              <span className="status-pill status-available">Verified</span>
            </div>
          </div>
        </Reveal>
      </section>
      )}


      <section className="relative z-10 px-5 pb-6 md:px-8">
        <Reveal delay={0.08}>
          <div className="mx-auto max-w-[1500px] lux-panel overflow-hidden rounded-[2.8rem] p-7 md:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
              <div>
                <p className="lux-label">Instagram</p>
                <h2 className="editorial-title mt-4 text-5xl leading-[0.92] md:text-7xl">Inspirație Instagram</h2>
                <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--muted)] md:text-base">
                  Urmărește profilul oficial neilzzbyanto pentru ultimele lucrări, story-uri și locuri libere. Cardurile de aici duc direct către Instagram.
                </p>
                <div className="mt-7">
                  <LuxuryButton href={homepageContent.instagramUrl || INSTAGRAM_URL}>
                    <Camera className="h-4 w-4" />
                    {homepageContent.instagramHandle || "Instagram"}
                  </LuxuryButton>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {images.slice(0, 3).map((image, index) => (
                  <a key={image.id} href={homepageContent.instagramUrl || INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="group overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--panel)] p-2 transition hover:-translate-y-1">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[1.45rem] bg-[#10060b]">
                      <Image src={image.image_url} alt={image.title || "Instagram neilzzbyanto"} fill sizes="(min-width: 1024px) 22vw, 80vw" className="object-cover opacity-90 transition duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                      <p className="absolute bottom-4 left-4 text-xs uppercase tracking-[0.28em] text-white/70">Instagram</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>
      <section className="relative z-10 px-5 py-20 md:px-8 md:py-24">
        <Reveal>
          <div className="lux-panel mx-auto grid max-w-[1320px] gap-8 rounded-[2.5rem] p-7 md:grid-cols-[.8fr_1.2fr] md:p-10">
            <div>
              <p className="lux-label">About Antonia</p>
              <h2 className="editorial-title mt-5 text-5xl leading-[0.92] md:text-7xl">2+ ani de atenție, igienă și perfecționare.</h2>
            </div>
            <div className="space-y-5 text-base leading-8 text-[var(--muted)]">
              <p>
                Sunt Antonia, iar neilzzbyanto este un atelier privat construit pentru cliente care vor un finish curat, discret și premium. Lucrez cu atenție la formă, structură și rezistență, nu pe grabă.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {["2+ ani experiență", "Cursuri & perfecționare", "Sterilizare strictă", "Materiale premium", "Experiență privată", "Clean finish"].map((item) => (
                  <div key={item} className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4">
                    <ShieldCheck className="mb-3 h-5 w-5 text-[var(--rose-strong)]" />
                    <p className="text-sm font-semibold text-[var(--text)]">{item}</p>
                  </div>
                ))}
              </div>
              <p>
                Igiena, sterilizarea instrumentelor, produse premium și comunicarea înainte de programare sunt prioritare. Totul este gândit pentru o experiență privată, sigură și personalizată.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="relative z-10 overflow-hidden border-y border-[var(--line)] py-7">
        <div className="marquee flex w-[200%] gap-10 text-[17vw] font-serif leading-none tracking-[-0.08em] text-[var(--text)]/[0.052] md:text-[8rem]">
          <span>neilzzbyanto · CLEAN SHAPES · QUIET LUXURY · </span>
          <span>neilzzbyanto · CLEAN SHAPES · QUIET LUXURY · </span>
        </div>
      </section>

      {siteSettings.featuredDesign !== false && (
      <section className="relative z-10 px-5 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1500px]">
          <Reveal className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
            <div>
              <p className="lux-label">Galerie preview</p>
              <h2 className="editorial-title mt-5 max-w-4xl text-5xl leading-[0.9] md:text-7xl">
                Work first.
                <br />
                Words second.
              </h2>
            </div>
            <LuxuryButton href="/gallery">Open full gallery</LuxuryButton>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {images.slice(0, 4).map((item, index) => (
              <Reveal key={item.id} delay={index * 0.07}>
                <motion.a
                  href="/gallery"
                  whileHover={{ y: -8 }}
                  className="group block overflow-hidden rounded-[1.8rem] border border-[var(--line)] bg-[var(--panel)] p-2.5 backdrop-blur-2xl md:rounded-[2rem] md:p-3"
                >
                  <div className={index % 2 === 0 ? "relative aspect-[3/4] overflow-hidden rounded-[1.35rem]" : "relative aspect-[3/5] overflow-hidden rounded-[1.35rem]"}>
                    <Image
                      src={item.image_url}
                      alt={item.title || "neilzzbyanto"}
                      fill
                      sizes="(min-width: 1024px) 25vw, 85vw"
                      className="object-cover opacity-88 saturate-[0.92] transition duration-1000 group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-5 left-5 right-5">
                      <p className="font-serif text-2xl text-white md:text-3xl">{item.title || "neilzzbyanto set"}</p>
                    </div>
                  </div>
                </motion.a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      )}

      {siteSettings.featuredReview !== false && (
      <section className="relative z-10 px-5 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1500px]">
          <Reveal className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
            <div>
              <p className="lux-label">Review-uri</p>
              <h2 className="editorial-title mt-5 max-w-4xl text-5xl leading-[0.9] md:text-7xl">
                Real words.
                <br />
                No performance.
              </h2>
            </div>
            <LuxuryButton href="/reviews">Read all</LuxuryButton>
          </Reveal>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {reviewCards.map((review, index) => (
              <Reveal key={review.id} delay={index * 0.07}>
                <article className="lux-panel h-full overflow-hidden rounded-[2rem] p-5 md:rounded-[2.2rem]">
                  {review.photo_url && <div className="relative mb-5 aspect-[4/3] overflow-hidden rounded-[1.45rem] border border-[var(--line)]"><Image src={review.photo_url} alt={review.name || "Review photo"} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" /></div>}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex gap-1 text-[var(--rose-strong)]">
                      {Array.from({ length: review.rating || 5 }).map((_, star) => (
                        <Star key={star} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    {review.is_featured && <span className="status-pill status-limited">Featured</span>}
                  </div>
                  <p className="mt-7 text-xl leading-9 text-[var(--muted)]">“{review.text}”</p>
                  <div className="mt-9 flex items-center justify-between gap-4 border-t border-[var(--line)] pt-5">
                    <p className="font-serif text-2xl">{review.name || "Clientă"}</p>
                    <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-[var(--faint)]">
                      <CheckCircle2 className="h-4 w-4" />
                      verified
                    </span>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      )}

      <section className="relative z-10 px-5 py-20 md:px-8 md:py-24">
        <Reveal>
          <div className="relative mx-auto max-w-[1500px] overflow-hidden rounded-[2.4rem] border border-[var(--line)] bg-[var(--panel)] p-7 shadow-[0_50px_150px_var(--shadow)] backdrop-blur-2xl md:rounded-[3rem] md:p-16">
            <div className="absolute right-[-12%] top-[-28%] h-72 w-72 rounded-full bg-[var(--rose)]/14 blur-[100px]" />
            <div className="relative grid gap-9 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="lux-label">Booking</p>
                <h2 className="editorial-title mt-5 max-w-5xl text-5xl leading-[0.9] md:text-7xl">
                  Send the idea.
                  <br />
                  Leave with the finish.
                </h2>
                <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--muted)]">
                  Programările se fac privat, direct pe Instagram, ca fiecare set să fie discutat curat înainte.
                </p>
              </div>
              <LuxuryButton href={homepageContent.instagramUrl || INSTAGRAM_URL} solid>
                <Camera className="h-4 w-4" />
                {homepageContent.instagramHandle || "Instagram"}
              </LuxuryButton>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="relative z-10 border-t border-[var(--line)] px-5 pb-24 pt-10 text-center md:px-8 md:pb-10">
        <p className="text-xl font-semibold tracking-[0.42em]">neilzzbyanto</p>
        <p className="mt-2 text-xs uppercase tracking-[0.55em] text-[var(--faint)]">by Antonia</p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-5 text-xs text-[var(--faint)] md:gap-6">
          <a className="transition hover:text-[var(--text)]" href="/gallery">Galerie</a>
          <a className="transition hover:text-[var(--text)]" href="/reviews">Review-uri</a>
          <a className="transition hover:text-[var(--text)]" href="/booking">Booking</a>
          <a className="transition hover:text-[var(--text)]" href="/about">About</a>
          <PrivateAccessLink className="transition hover:text-[var(--text)]">Private access</PrivateAccessLink>
        </div>
      </footer>

      <MobileBottomNav instagramUrl={homepageContent.instagramUrl || INSTAGRAM_URL} />
    </main>
  );
}
