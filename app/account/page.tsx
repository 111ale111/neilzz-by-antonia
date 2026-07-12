"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Bell,
  CalendarDays,
  Crown,
  Download,
  Gem,
  Gift,
  ImagePlus,
  KeyRound,
  Lock,
  LogOut,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Trophy,
  Upload,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PwaInstallCard } from "@/components/pwa-install-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { downloadDataUrl, renderGiftCardPng } from "@/lib/gift-card-image";
import { detectDevice, endpointPreview } from "@/lib/device";

type GiftCard = {
  id: string;
  code: string;
  recipient_name: string | null;
  amount: number | null;
  message: string | null;
  issued_at: string | null;
  expires_at: string | null;
  status: string;
};

type PushDiag = {
  secureContext: boolean;
  origin: string;
  permission: string;
  sw: boolean;
  swVersion: string;
  browserSub: boolean;
  supabaseSub: boolean;
  endpointPreview: string;
  device: string;
  vapid: boolean;
  lastLocalTest: string;
  lastRealTest: string;
  lastError: string;
};

type PushDevice = {
  id: string;
  endpoint: string;
  user_agent: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type Profil = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  is_activated: boolean | null;
  visit_count: number | null;
  loyalty_goal: number | null;
  created_at?: string | null;
  notification_permission?: string | null;
};

type Appointment = {
  id: string;
  appointment_date: string;
  appointment_time: string | null;
  status: string;
  note: string | null;
  custom_note?: string | null;
};

type Reward = {
  id: string;
  code: string;
  reward_number: number;
  status: string;
  issued_at: string;
  reward_type?: string | null;
};

type Inspiration = {
  id: string;
  image_url: string;
  title: string | null;
  note: string | null;
  source_type: string;
  created_at: string;
};

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  status: string | null;
  created_at: string;
  read_at: string | null;
};

type MyReview = {
  id: string;
  rating: number | null;
  text: string;
  is_approved: boolean | null;
  is_featured?: boolean | null;
  photo_url?: string | null;
  created_at: string | null;
};

type AccentOption = {
  value: string;
  label: string;
  description: string;
  swatch: string;
  bg: string;
};

const accentOptions: AccentOption[] = [
  { value: "rose-gold", label: "Rose Gold", description: "Luxury roz auriu, default neilzzbyanto.", swatch: "#f0a7ba", bg: "#040304" },
  { value: "champagne", label: "Aur de Șampanie", description: "Aur cald, ivory premium.", swatch: "#c9a86a", bg: "#0a0a0c" },
  { value: "emerald", label: "Smarald Imperial", description: "Verde bijuterie, editorial.", swatch: "#3ed6a3", bg: "#04120d" },
  { value: "sapphire", label: "Safir de Miezul Nopții", description: "Albastru rece, profund.", swatch: "#7ba3ff", bg: "#050810" },
  { value: "bordeaux", label: "Bordeaux Vintage", description: "Roșu vin, romantic.", swatch: "#e06a84", bg: "#120507" },
  { value: "amethyst", label: "Ametist Regal", description: "Mov luxury, glossy.", swatch: "#b78aff", bg: "#0b0614" },
  { value: "rose-paris", label: "Aur Roz Parizian", description: "Roz-auriu delicat, soft.", swatch: "#f0b7b0", bg: "#160d0e" },
  { value: "amber", label: "Chihlimbar de Toscana", description: "Chihlimbar cald, cozy.", swatch: "#f0a94f", bg: "#120a03" },
  { value: "turquoise", label: "Turcoaz de Riviera", description: "Turcoaz proaspăt, marin.", swatch: "#4fdbe4", bg: "#031012" },
  { value: "onyx", label: "Onix & Platină", description: "Gri platină, minimal.", swatch: "#d6d9e0", bg: "#050506" },
];

function safeAccent(value?: string | null) {
  return accentOptions.some((item) => item.value === value) ? value! : "rose-gold";
}

const rankMap = [
  { name: "Clientă nouă", min: 0, next: 5, tone: "basic", benefits: ["Cont privat neilzzbyanto", "Board de inspirații", "Istoric programări"] },
  { name: "Clientă regulară", min: 5, next: 10, tone: "regular", benefits: ["Reward-uri deblocate", "Review verificat", "Status afișat în cont"] },
  { name: "Clientă VIP", min: 10, next: 15, tone: "vip", benefits: ["Prioritate la programări", "Reward-uri premium", "Badge VIP lângă nume"] },
  { name: "Clientă elite", min: 15, next: null, tone: "elite", benefits: ["Toate reward-urile", "Nivel maxim", "Badge Elite premium"] },
];

function getRank(visits: number) {
  if (visits >= 15) return rankMap[3];
  if (visits >= 10) return rankMap[2];
  if (visits >= 5) return rankMap[1];
  return rankMap[0];
}

const rewardMilestones = [
  { visits: 3, label: "French gratuit", short: "French" },
  { visits: 5, label: "10% OFF", short: "10%" },
  { visits: 7, label: "Charms gratuit", short: "Charms" },
  { visits: 10, label: "25% OFF", short: "25%" },
  { visits: 15, label: "50% OFF", short: "50%" },
];


function rewardForNumber(rewardNumber: number) {
  return rewardMilestones[Math.max(0, Math.min(rewardNumber - 1, rewardMilestones.length - 1))] || rewardMilestones[0];
}

function rewardForVisits(visits: number) {
  return rewardMilestones.filter((item) => visits >= item.visits);
}

function nextRewardForVisits(visits: number) {
  return rewardMilestones.find((item) => visits < item.visits) || null;
}

function appointmentDateTime(item: Appointment) {
  const time = formatTime(item.appointment_time);
  return new Date(`${item.appointment_date}T${time === "—" ? "23:59" : time}:00`);
}

function isActiveAppointment(item: Appointment) {
  const status = (item.status || "").toLowerCase();
  if (["completed", "cancelled", "canceled", "done", "finalizată", "anulată"].includes(status)) return false;
  return appointmentDateTime(item).getTime() >= Date.now() - 60 * 60 * 1000;
}

function appointmentStatusMeta(item: Appointment) {
  const status = (item.status || "upcoming").toLowerCase();
  if (["completed", "done", "finalizată"].includes(status) || appointmentDateTime(item).getTime() < Date.now() - 60 * 60 * 1000) {
    return { label: "Finalizată", className: "status-pill status-completed mt-0" };
  }
  if (["cancelled", "canceled", "anulată"].includes(status)) {
    return { label: "Anulată", className: "status-pill status-full mt-0" };
  }
  if (["confirmed", "confirmată", "upcoming"].includes(status)) {
    return { label: "Urmează", className: "status-pill status-available mt-0" };
  }
  if (["pending", "scheduled", "programată"].includes(status)) {
    return { label: "În așteptare", className: "status-pill status-pending mt-0" };
  }
  return { label: status, className: "status-pill status-limited mt-0" };
}

function dailyResetCountdown() {
  const roNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Bucharest" }));
  const reset = new Date(roNow);
  reset.setDate(reset.getDate() + 1);
  reset.setHours(0, 0, 0, 0);
  const diff = Math.max(0, reset.getTime() - roNow.getTime());
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
}

function initials(name?: string | null, email?: string | null) {
  const source = name || email || "neilzzbyanto";
  const parts = source.replace(/@.*/, "").split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] || "N").toUpperCase() + (parts[1]?.[0] || "Z").toUpperCase();
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("ro-RO", { day: "2-digit", month: "long", year: "numeric" });
}

function formatTime(value?: string | null) {
  return (value || "").slice(0, 5) || "—";
}

function escapeSvg(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Fișierul nu a putut fi citit."));
    reader.readAsDataURL(file);
  });
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

// Count-up discret, o singură dată; respectă prefers-reduced-motion.
function CountUp({ value, suffix = "", duration = 700 }: { value: number; suffix?: string; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{display}{suffix}</>;
}

// Empty state premium, compact (iconiță + titlu + o frază + CTA).
function EmptyState({ icon, title, text, actionLabel, onAction }: { icon: ReactNode; title: string; text: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="grid place-items-center rounded-[1.6rem] border border-dashed border-[var(--line)] bg-[var(--panel)] p-6 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl border border-[var(--line)] bg-[var(--panel-strong)] text-[var(--rose-strong)]">{icon}</span>
      <p className="mt-3 font-serif text-2xl">{title}</p>
      <p className="mt-1.5 max-w-sm text-sm leading-6 text-[var(--muted)]">{text}</p>
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className="lux-action lux-action-soft mt-4 rounded-full px-5 py-2.5 text-sm font-semibold">{actionLabel}</button>
      )}
    </div>
  );
}

export default function AccountPage() {
  const supabase = createClient();
  const [profile, setProfil] = useState<Profil | null>(null);
  const [appointments, setProgramări] = useState<Appointment[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [inspirations, setInspirații] = useState<Inspiration[]>([]);
  const [notifications, setNotificări] = useState<NotificationItem[]>([]);
  const [myReviews, setMyReviews] = useState<MyReview[]>([]);
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [pushDiag, setPushDiag] = useState<PushDiag>({ secureContext: false, origin: "", permission: "—", sw: false, swVersion: "v20", browserSub: false, supabaseSub: false, endpointPreview: "—", device: "—", vapid: false, lastLocalTest: "—", lastRealTest: "—", lastError: "" });
  const [pushDevices, setPushDevices] = useState<PushDevice[]>([]);
  const [moreOpen, setMoreOpen] = useState(false);
  const [code, setCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [inspirationFile, setInspirationFile] = useState<File | null>(null);
  const [inspirationTitle, setInspirationTitle] = useState("");
  const [inspirationNote, setInspirationNote] = useState("");
  const [resetEmailMessage, setResetEmailMessage] = useState("");
  const [newParolă, setNewParolă] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewFile, setReviewFile] = useState<File | null>(null);
  const [reviewPreviewUrl, setReviewPreviewUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);
  const [showParolă, setShowParolă] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [fullscreenInspiration, setFullscreenInspiration] = useState<Inspiration | null>(null);
  const [selectedAccent, setSelectedAccent] = useState("rose-gold");
  const [dailyReset, setDailyReset] = useState("00h 00m 00s");

  async function loadAccount() {
    setLoading(true);
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) {
      window.location.href = "/login";
      return;
    }

    let { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (!profileData && user.email) {
      const retryByEmail = await supabase.from("profiles").select("*").ilike("email", user.email).maybeSingle();
      profileData = retryByEmail.data;
    }
    if (!profileData) {
      await supabase.from("profiles").insert({
        id: user.id,
        email: user.email,
        full_name: user.email?.split("@")[0] || "Clientă neilzzbyanto",
        role: "client",
        is_activated: false,
        visit_count: 0,
        loyalty_goal: 5,
      });
      const retry = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      profileData = retry.data;
    }

    const fallbackName =
      (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
      (typeof user.user_metadata?.name === "string" && user.user_metadata.name) ||
      user.email?.split("@")[0] ||
      "Clientă neilzzbyanto";

    if (profileData) {
      const typed = profileData as Profil;
      if (!typed.full_name) {
        await supabase.from("profiles").update({ full_name: fallbackName, email: user.email }).eq("id", typed.id);
        typed.full_name = fallbackName;
        typed.email = user.email || typed.email;
      }
      setProfil(typed);
      setFullName(typed.full_name || fallbackName);
    } else {
      const fallbackProfil: Profil = {
        id: user.id,
        email: user.email || null,
        full_name: fallbackName,
        avatar_url: null,
        role: "client",
        is_activated: false,
        visit_count: 0,
        loyalty_goal: 5,
        created_at: new Date().toISOString(),
        notification_permission: "unknown",
      };
      setProfil(fallbackProfil);
      setFullName(fallbackName);
      setMessage("Profilul nu a fost găsit în Supabase. Rulează supabase-v82-full-working.sql dacă butoanele nu salvează permanent.");
    }

    const activeProfilId = (profileData as Profil | null)?.id || user.id;
    const [appointmentRes, rewardRes, inspirationRes, notificationRes, reviewRes] = await Promise.all([
      supabase.from("client_appointments").select("id,appointment_date,appointment_time,status,note,custom_note").eq("client_id", activeProfilId).order("appointment_date", { ascending: false }),
      supabase.from("client_rewards").select("id,code,reward_number,status,issued_at,reward_type").eq("client_id", activeProfilId).order("issued_at", { ascending: false }),
      supabase.from("client_inspirations").select("id,image_url,title,note,source_type,created_at").eq("client_id", activeProfilId).order("created_at", { ascending: false }),
      supabase.from("client_notifications").select("id,title,message,status,created_at,read_at").eq("client_id", activeProfilId).order("created_at", { ascending: false }).limit(10),
      supabase.from("reviews").select("id,rating,text,is_approved,is_featured,photo_url,created_at").eq("user_id", activeProfilId).order("created_at", { ascending: false }),
    ]);

    if (appointmentRes.data) setProgramări(appointmentRes.data as Appointment[]);
    if (rewardRes.data) setRewards(rewardRes.data as Reward[]);
    if (inspirationRes.data) setInspirații(inspirationRes.data as Inspiration[]);
    if (notificationRes.data) setNotificări(notificationRes.data as NotificationItem[]);
    if (reviewRes.data) setMyReviews(reviewRes.data as MyReview[]);

    // Carduri cadou asociate emailului contului (RLS filtrează automat).
    const { data: giftData } = await supabase
      .from("gift_cards")
      .select("id,code,recipient_name,amount,message,issued_at,expires_at,status")
      .order("issued_at", { ascending: false });
    if (giftData) setGiftCards(giftData as GiftCard[]);

    setLoading(false);
  }

  async function downloadGiftCard(card: GiftCard) {
    const dataUrl = await renderGiftCardPng({
      recipient_name: card.recipient_name,
      amount: card.amount,
      message: card.message,
      code: card.code,
      expires_at: card.expires_at,
    });
    if (dataUrl) downloadDataUrl(dataUrl, `gift-card-${card.code}.png`);
  }

  useEffect(() => {
    loadAccount();
    refreshPushDiag();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (profile?.id) refreshPushDiag();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  // Blochează scroll-ul din spate cât timp drawer-ul „Mai multe" e deschis.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = moreOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [moreOpen]);

  function selectTab(id: string) {
    setActiveTab(id);
    setMoreOpen(false);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    if (!loading && typeof window !== "undefined" && !window.localStorage.getItem("neilzz-quick-guide-seen")) {
      setGuideOpen(true);
      window.localStorage.setItem("neilzz-quick-guide-seen", "1");
    }
  }, [loading]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setSelectedAccent(safeAccent(window.localStorage.getItem("neilzz-accent")));
  }, []);

  function changeAccent(accent: string) {
    const nextAccent = safeAccent(accent);
    // Single source of truth, applied immediately on first click:
    setSelectedAccent(nextAccent);                                   // 1. React state
    document.documentElement.dataset.accent = nextAccent;            // 2. data-accent (CSS vars)
    window.localStorage.setItem("neilzz-accent", nextAccent);        // 3. persistență
    window.dispatchEvent(new CustomEvent("neilzz-accent-changed", { detail: { accent: nextAccent } }));
    setMessage(`Tema ${accentOptions.find((item) => item.value === nextAccent)?.label || "Rose Gold"} a fost aplicată pe contul tău.`);
  }

  async function activateAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setMessage("");
    setActionLoading("activate");
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setMessage("Introdu codul de activare.");
      setActionLoading(null);
      return;
    }

    const { data: existingCode, error: codeError } = await supabase.from("activation_codes").select("id,code,is_used").eq("code", cleanCode).eq("is_used", false).maybeSingle();
    const demoCodeAllowed = cleanCode === "NB-ABC-123" && codeError;
    if (!existingCode && !demoCodeAllowed) {
      setMessage(codeError ? `${codeError.message}. Rulează supabase-v82-full-working.sql.` : "Cod invalid sau deja folosit.");
      setActionLoading(null);
      return;
    }

    await supabase.from("profiles").update({ is_activated: true }).eq("id", profile.id);
    if (existingCode) await supabase.from("activation_codes").update({ is_used: true, used_by: profile.id, used_at: new Date().toISOString() }).eq("id", existingCode.id);
    await supabase.from("client_notifications").insert({ client_id: profile.id, title: "Cont activat", message: "Contul tău este acum verificat. Poți lăsa review-uri verificate.", type: "account" });
    setCode("");
    setMessage("Cont activat. Acum poți lăsa review verificat.");
    await loadAccount();
    setActionLoading(null);
  }

  async function saveProfil(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setActionLoading("profile");
    setMessage("");
    let avatarUrl = profile.avatar_url;

    if (avatarFile) {
      const ext = avatarFile.name.split(".").pop() || "jpg";
      const path = `${profile.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("avatars").upload(path, avatarFile, { upsert: true });
      if (error) {
        avatarUrl = await fileToDataUrl(avatarFile);
        setMessage("Avatar salvat local în profil. Pentru URL public, creează bucket-ul Supabase avatars.");
      } else {
        const { data } = supabase.storage.from("avatars").getPublicUrl(path);
        avatarUrl = data.publicUrl;
      }
    }

    const { error: updateError } = await supabase.from("profiles").update({ full_name: fullName.trim() || profile.email?.split("@")[0] || "Clientă neilzzbyanto", avatar_url: avatarUrl }).eq("id", profile.id);
    if (updateError) {
      setMessage(updateError.message);
      setActionLoading(null);
      return;
    }
    setAvatarFile(null);
    setMessage("Profil actualizat.");
    await loadAccount();
    setActionLoading(null);
  }

  async function uploadInspiration(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setActionLoading("inspiration");
    setMessage("");
    if (!inspirationFile) {
      setMessage("Alege o poză înainte de upload.");
      setActionLoading(null);
      return;
    }
    const ext = inspirationFile.name.split(".").pop() || "jpg";
    const path = `${profile.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("inspirations").upload(path, inspirationFile);
    let imageUrl = "";
    if (error) {
      imageUrl = await fileToDataUrl(inspirationFile);
    } else {
      const { data } = supabase.storage.from("inspirations").getPublicUrl(path);
      imageUrl = data.publicUrl;
    }
    const { error: insertError } = await supabase.from("client_inspirations").insert({
      client_id: profile.id,
      image_url: imageUrl,
      title: inspirationTitle.trim() || "Inspirație personală",
      note: inspirationNote.trim() || null,
      source_type: "upload",
    });
    if (insertError) {
      setMessage(insertError.message);
      setActionLoading(null);
      return;
    }
    setInspirationFile(null);
    setInspirationTitle("");
    setInspirationNote("");
    setMessage(error ? "Inspirația a fost adăugată. Creează bucket-ul Supabase inspirations pentru URL public permanent." : "Inspirația a fost adăugată.");
    await loadAccount();
    setActionLoading(null);
  }

  async function deleteInspiration(item: Inspiration) {
    if (!confirm("Ștergi această inspirație?")) return;
    await supabase.from("client_inspirations").delete().eq("id", item.id);
    await loadAccount();
  }

  async function generateReward() {
    if (!profile) return;
    const visits = Number(profile.visit_count || 0);
    const earnedRewards = rewardForVisits(visits);
    const activeCount = rewards.length;
    if (earnedRewards.length <= activeCount) {
      setMessage("Nu ai reward nou disponibil încă.");
      return;
    }
    const rewardNumber = activeCount + 1;
    const reward = rewardForNumber(rewardNumber);
    const codeValue = `NB-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const { error: rewardError } = await supabase.from("client_rewards").insert({
      client_id: profile.id,
      reward_number: rewardNumber,
      code: codeValue,
      reward_type: reward.label,
      status: "active",
    });
    if (rewardError) {
      setMessage(rewardError.message);
      return;
    }
    await supabase.from("client_notifications").insert({ client_id: profile.id, title: "Reward disponibil", message: `Ai deblocat Reward #${rewardNumber}: ${reward.label}.`, type: "reward" });
    setMessage("Reward card generat.");
    await loadAccount();
  }

  function downloadVoucher(reward: Reward) {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1600;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const gradient = ctx.createLinearGradient(0, 0, 1200, 1600);
    gradient.addColorStop(0, "#050304");
    gradient.addColorStop(0.58, "#250713");
    gradient.addColorStop(1, "#e8b7c6");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 1600);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    roundRect(ctx, 86, 92, 1028, 1416, 70, true, false);
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.lineWidth = 2;
    roundRect(ctx, 86, 92, 1028, 1416, 70, false, true);

    ctx.textAlign = "center";
    ctx.fillStyle = "#fff8f1";
    ctx.font = "64px Georgia";
    ctx.fillText("neilzzbyanto", 600, 235);
    ctx.fillStyle = "#f3c5d2";
    ctx.font = "28px Arial";
    ctx.fillText("by Antonia", 600, 295);
    ctx.strokeStyle = "rgba(243,197,210,0.35)";
    ctx.beginPath();
    ctx.moveTo(250, 405);
    ctx.lineTo(950, 405);
    ctx.stroke();

    ctx.fillStyle = "#fff8f1";
    ctx.font = "124px Georgia";
    ctx.fillText(rewardForNumber(reward.reward_number).label.toUpperCase(), 600, 565);
    ctx.fillStyle = "#f3c5d2";
    ctx.font = "34px Arial";
    ctx.fillText("VOUCHER REWARD", 600, 645);
    ctx.fillStyle = "#fff8f1";
    ctx.font = "64px Georgia";
    ctx.fillText(profile?.full_name || "Clientă neilzzbyanto", 600, 825);
    ctx.fillStyle = "#f0c0ce";
    ctx.font = "36px Arial";
    ctx.fillText(`Reward #${reward.reward_number}`, 600, 925);
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    roundRect(ctx, 220, 1035, 760, 150, 40, true, false);
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    roundRect(ctx, 220, 1035, 760, 150, 40, false, true);
    ctx.fillStyle = "#fff8f1";
    ctx.font = "44px Arial";
    ctx.fillText(reward.code, 600, 1130);
    ctx.fillStyle = "#f3c5d2";
    ctx.font = "30px Arial";
    ctx.fillText(`Emis ${formatDate(reward.issued_at)}`, 600, 1290);
    ctx.fillStyle = "rgba(255,248,241,0.55)";
    ctx.font = "24px Arial";
    ctx.fillText("Arată acest voucher la programarea ta neilzzbyanto.", 600, 1380);

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${reward.code}.png`;
    link.click();
  }

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: boolean, stroke: boolean) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  async function sendResetEmail() {
    if (!profile?.email) {
      setResetEmailMessage("Nu există email pe profil.");
      return;
    }
    setActionLoading("reset");
    setResetEmailMessage("");
    const { error } = await supabase.auth.resetPasswordForEmail(profile.email, { redirectTo: `${window.location.origin}/account` });
    setResetEmailMessage(error ? error.message : "Email de resetare trimis. Verifică inbox/spam.");
    setActionLoading(null);
  }

  async function updateParolă() {
    if (!newParolă) {
      setResetEmailMessage("Scrie parola nouă.");
      return;
    }
    setActionLoading("password");
    const { error } = await supabase.auth.updateUser({ password: newParolă });
    setResetEmailMessage(error ? error.message : "Parola a fost actualizată.");
    setNewParolă("");
    setActionLoading(null);
  }

  useEffect(() => {
    if (!reviewFile) {
      setReviewPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(reviewFile);
    setReviewPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [reviewFile]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (["overview", "profile", "appointments", "rewards", "giftcards", "daily", "inspirations", "reviews", "notifications", "appearance", "security"].includes(tab || "")) {
      setActiveTab(tab as string);
    }
  }, []);

  useEffect(() => {
    setDailyReset(dailyResetCountdown());
    const timer = window.setInterval(() => setDailyReset(dailyResetCountdown()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setMessage("");
    if (!profile.is_activated) {
      setMessage("Activează contul înainte să lași un review verificat.");
      return;
    }
    if (reviewText.trim().length < 10) {
      setMessage("Scrie un review de minimum 10 caractere.");
      return;
    }
    setActionLoading("review");
    let photoUrl: string | null = null;
    if (reviewFile) {
      const ext = reviewFile.name.split(".").pop() || "jpg";
      const path = `${profile.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("review-photos").upload(path, reviewFile, { upsert: true });
      if (uploadError) {
        photoUrl = await fileToDataUrl(reviewFile);
      } else {
        const { data } = supabase.storage.from("review-photos").getPublicUrl(path);
        photoUrl = data.publicUrl;
      }
    }
    const { error } = await supabase.from("reviews").insert({
      user_id: profile.id,
      name: profile.full_name || profile.email?.split("@")[0] || "Clientă neilzzbyanto",
      rating: reviewRating,
      text: reviewText.trim(),
      photo_url: photoUrl,
      is_approved: false,
      is_featured: false,
    });
    if (error) {
      setMessage(error.message);
      setActionLoading(null);
      return;
    }
    await supabase.from("client_notifications").insert({
      client_id: profile.id,
      title: "Review trimis",
      message: "Review-ul tău a fost trimis și așteaptă aprobarea Antoniei.",
      type: "review",
      status: "in_app",
    });
    setReviewText("");
    setReviewRating(5);
    setReviewFile(null);
    setMessage("Review trimis. Va apărea public după aprobare.");
    setActionLoading(null);
  }

  async function getNotificationRegistration() {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
    const registration = await navigator.serviceWorker.register("/sw.js?v=20", { scope: "/" });
    await navigator.serviceWorker.ready;
    return registration;
  }

  // Salvează subscripția în Supabase prin ruta API (RLS pe user autentificat).
  async function saveSubscription(subscription: PushSubscription): Promise<{ saved: boolean; error?: string }> {
    const json = subscription.toJSON();
    try {
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
          userAgent: navigator.userAgent,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.saved) return { saved: false, error: data?.error || "Salvarea în Supabase a eșuat." };
      return { saved: true };
    } catch (error) {
      return { saved: false, error: error instanceof Error ? error.message : "Cerere eșuată." };
    }
  }

  async function loadPushDevices() {
    if (!profile) return;
    const { data } = await supabase
      .from("push_subscriptions")
      .select("id,endpoint,user_agent,created_at,updated_at")
      .eq("client_id", profile.id)
      .order("updated_at", { ascending: false });
    if (data) setPushDevices(data as PushDevice[]);
  }

  async function refreshPushDiag() {
    setPushDiag((prev) => {
      const next: PushDiag = {
        ...prev,
        secureContext: typeof window !== "undefined" ? window.isSecureContext : false,
        origin: typeof window !== "undefined" ? window.location.origin : "",
        permission: typeof window !== "undefined" && "Notification" in window ? Notification.permission : "unsupported",
        vapid: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      };
      return next;
    });
    try {
      let sw = false;
      let browserSub = false;
      let supabaseSub = false;
      let endpoint: string | null = null;
      if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        sw = !!reg?.active;
        const sub = reg?.pushManager ? await reg.pushManager.getSubscription() : null;
        browserSub = !!sub;
        endpoint = sub?.endpoint ?? null;
        if (sub) {
          const { count } = await supabase
            .from("push_subscriptions")
            .select("id", { count: "exact", head: true })
            .eq("endpoint", sub.endpoint);
          supabaseSub = (count || 0) > 0;
        }
      }
      setPushDiag((prev) => ({
        ...prev,
        sw,
        browserSub,
        supabaseSub,
        endpointPreview: endpointPreview(endpoint),
        device: typeof navigator !== "undefined" ? detectDevice(navigator.userAgent) : "—",
        lastError: "",
      }));
    } catch (error) {
      setPushDiag((prev) => ({ ...prev, lastError: error instanceof Error ? error.message : String(error) }));
    }
    await loadPushDevices();
  }

  async function removeDevice(device: { endpoint: string }) {
    setActionLoading("remove-device");
    try {
      const res = await fetch("/api/push/unsubscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: device.endpoint }),
      });
      const data = await res.json().catch(() => ({}));
      // Dacă e dispozitivul curent, dezabonează și în browser.
      if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = reg?.pushManager ? await reg.pushManager.getSubscription() : null;
        if (sub && sub.endpoint === device.endpoint) await sub.unsubscribe();
      }
      setMessage(data?.deleted ? "Dispozitivul a fost eliminat." : `Nu s-a eliminat: ${data?.error || "necunoscut"}`);
      await refreshPushDiag();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Eliminarea a eșuat.");
    }
    setActionLoading(null);
  }

  async function testRealPush() {
    setActionLoading("test-real");
    try {
      const res = await fetch("/api/push/test", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (data?.error) {
        setMessage(`Test Push real: ${data.error}`);
      } else {
        const firstErr = Array.isArray(data.errors) && data.errors[0] ? ` Motiv: ${data.errors[0].message} (HTTP ${data.errors[0].statusCode}).` : "";
        setMessage(`Test Push real: ${data.sent}/${data.subscriptionsFound} trimise, ${data.failed} eșuate.${firstErr}`);
      }
      setPushDiag((prev) => ({ ...prev, lastRealTest: new Date().toLocaleTimeString("ro-RO") }));
      await refreshPushDiag();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Testul Push real a eșuat.");
    }
    setActionLoading(null);
  }

  async function enableNotificări() {
    if (!profile) return;
    setActionLoading("notifications");
    try {
      if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
        setMessage("Browserul nu suportă notificări push.");
        setActionLoading(null);
        return;
      }
      if (!window.isSecureContext) {
        setMessage("Notificările push necesită HTTPS (sau localhost).");
        setActionLoading(null);
        return;
      }
      const permission = await Notification.requestPermission();
      await supabase.from("profiles").update({ notification_permission: permission }).eq("id", profile.id);
      if (permission !== "granted") {
        setMessage("Permisiunea pentru notificări nu a fost acordată.");
        await refreshPushDiag();
        setActionLoading(null);
        return;
      }
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        setMessage("Lipsește NEXT_PUBLIC_VAPID_PUBLIC_KEY. Configurează cheile VAPID.");
        setActionLoading(null);
        return;
      }
      const registration = await getNotificationRegistration();
      if (!registration?.pushManager) {
        setMessage("Service Worker-ul nu este disponibil pe acest dispozitiv.");
        setActionLoading(null);
        return;
      }
      const existing = await registration.pushManager.getSubscription();
      const subscription = existing || (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      }));
      const { saved, error } = await saveSubscription(subscription);
      setMessage(saved ? "Dispozitivul a fost înregistrat pentru notificări push." : `Push neactivat: ${error}`);
      await refreshPushDiag();
      await loadAccount();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Notificările nu au putut fi activate.");
    }
    setActionLoading(null);
  }

  async function reregisterDevice() {
    if (!profile) return;
    setActionLoading("reregister");
    try {
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        setMessage("Lipsește NEXT_PUBLIC_VAPID_PUBLIC_KEY.");
        setActionLoading(null);
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setMessage("Permisiunea pentru notificări nu a fost acordată.");
        setActionLoading(null);
        return;
      }
      const registration = await getNotificationRegistration();
      if (!registration?.pushManager) {
        setMessage("Service Worker-ul nu este disponibil.");
        setActionLoading(null);
        return;
      }

      // 1-3. Curăță întâi endpoint-ul VECHI al ACESTUI browser din Supabase, apoi din browser.
      const existing = await registration.pushManager.getSubscription();
      if (existing) {
        const oldEndpoint = existing.endpoint;
        await fetch("/api/push/unsubscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: oldEndpoint }),
        }).catch(() => {});
        await existing.unsubscribe().catch(() => {});
      }

      // 4. Actualizează service worker-ul.
      await registration.update().catch(() => {});

      // 5-6. Abonament nou cu cheia VAPID actuală + salvare.
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
      const { saved, error } = await saveSubscription(subscription);

      // 9. Succes doar dacă noul endpoint e salvat.
      setMessage(saved ? "Dispozitivul a fost reînregistrat cu noua cheie VAPID." : `Reînregistrare eșuată: ${error}`);
      await refreshPushDiag();
      await loadAccount();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Reînregistrarea a eșuat.");
    }
    setActionLoading(null);
  }

  async function testNotification() {
    setMessage("");
    try {
      if (typeof window === "undefined" || !("Notification" in window)) {
        setMessage("Browserul nu suportă notificări.");
        return;
      }
      let permission = Notification.permission;
      if (permission !== "granted") permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setMessage("Permisiunea pentru notificări nu este activă.");
        return;
      }
      const registration = await getNotificationRegistration();
      if (registration?.showNotification) {
        await registration.showNotification("Test neilzzbyanto", {
          body: "Notificările simple merg pe acest dispozitiv.",
          icon: "/icon-192.png?v=20",
          badge: "/icon-192.png?v=20",
          tag: `neilzz-test-${Date.now()}`,
        });
      } else {
        new Notification("Test neilzzbyanto", { body: "Notificările pe telefon merg." });
      }
      setPushDiag((prev) => ({ ...prev, lastLocalTest: new Date().toLocaleTimeString("ro-RO") }));
      setMessage("Test local trimis. Verifică notificarea din browser / Notification Center.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Notificarea test nu a putut fi trimisă.");
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const visitCount = Number(profile?.visit_count || 0);
  const rank = getRank(visitCount);
  const nextRankVizite = rank.next;
  const visitsToNextRank = nextRankVizite ? Math.max(nextRankVizite - visitCount, 0) : 0;
  const nextReward = nextRewardForVisits(visitCount);
  const previousRewardVisits = [...rewardMilestones].reverse().find((item) => visitCount >= item.visits)?.visits || 0;
  const targetRewardVisits = nextReward?.visits || rewardMilestones[rewardMilestones.length - 1].visits;
  const rewardRange = Math.max(1, targetRewardVisits - previousRewardVisits);
  const rewardProgress = nextReward ? Math.max(0, visitCount - previousRewardVisits) : rewardRange;
  const rewardPercent = nextReward ? Math.min(100, Math.round((rewardProgress / rewardRange) * 100)) : 100;
  const rewardsEarned = rewardForVisits(visitCount).length;
  const canGenerateReward = rewardsEarned > rewards.length;
  const sortedAppointments = [...appointments].sort((a, b) => appointmentDateTime(a).getTime() - appointmentDateTime(b).getTime());
  const upcomingAppointments = sortedAppointments.filter(isActiveAppointment);
  const pastAppointments = sortedAppointments.filter((item) => !isActiveAppointment(item)).reverse();
  const nextAppointment = upcomingAppointments[0];
  const completedRewards = rewardMilestones.filter((item) => visitCount >= item.visits);
  const lockedRewards = rewardMilestones.filter((item) => visitCount < item.visits);
  const completionItems = [
    { label: "Adaugă numele complet", done: Boolean(profile?.full_name), action: "profile" },
    { label: "Adaugă poză de profil", done: Boolean(profile?.avatar_url), action: "profile" },
    { label: "Activează contul cu codul primit", done: Boolean(profile?.is_activated), action: "profile" },
    { label: "Salvează prima inspirație", done: inspirations.length > 0, action: "inspirations" },
    { label: "Activează notificările", done: notifications.length > 0 || profile?.notification_permission === "granted", action: "notifications" },
  ];
  const profileCompletion = Math.round((completionItems.filter((item) => item.done).length / completionItems.length) * 100);

  if (loading) return <main className="grid min-h-screen place-items-center bg-[var(--bg)] text-[var(--text)]">Se încarcă...</main>;

  const tabs = [
    { id: "overview", label: "Acasă" },
    { id: "profile", label: "Profil" },
    { id: "appointments", label: "Programări" },
    { id: "rewards", label: "Rewards" },
    { id: "giftcards", label: "Carduri cadou" },
    { id: "inspirations", label: "Inspirații" },
    { id: "reviews", label: "Review-uri" },
    { id: "notifications", label: "Notificări" },
    { id: "appearance", label: "Temă" },
    { id: "security", label: "Securitate" },
  ];

  return (
    <main className="app-shell-bg relative min-h-screen overflow-hidden bg-[var(--bg)] px-5 py-8 text-[var(--text)] md:px-8">
      <div className="lux-noise" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 md:mb-8">
          <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-[var(--muted)] shadow-[0_12px_36px_var(--shadow)] backdrop-blur-xl transition hover:bg-[var(--panel-strong)] hover:text-[var(--text)]"><ArrowLeft className="h-4 w-4" /> Home</Link>
          <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
            <ThemeToggle />
            {profile?.role === "admin" && <Link href="/dashboard" className="inline-flex min-h-11 items-center rounded-full border border-[var(--line)] bg-[var(--panel-strong)] px-4 py-2 text-sm font-semibold shadow-[0_12px_36px_var(--shadow)] backdrop-blur-xl">Dashboard</Link>}
            <button onClick={() => setGuideOpen(true)} className="guide-lux-button inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold"><Sparkles className="h-4 w-4" /> Ghid rapid</button>
            <button onClick={logout} className="logout-lux inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold"><LogOut className="h-4 w-4" /> Logout</button>
          </div>
        </div>

        {(message || resetEmailMessage) && (
          <div className="mb-5 rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-5 py-4 text-sm text-[var(--rose-strong)]">{message || resetEmailMessage}</div>
        )}

        {!profile?.is_activated && (
          <section className="mb-5 rounded-[2rem] border border-[var(--rose)]/35 bg-[color-mix(in_srgb,var(--rose)_10%,var(--panel))] p-5 md:p-6">
            <p className="lux-label">Cont neverificat</p>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl">Activează contul</h2>
            <p className="mt-2 text-sm leading-7 text-[var(--muted)]">Introdu codul privat primit de la Antonia ca să poți lăsa review verificat și să apară statusul de clientă reală.</p>
            <form onSubmit={activateAccount} className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
              <input className="lux-input uppercase tracking-[.18em]" placeholder="NB-ABC-123" value={code} onChange={(e) => setCode(e.target.value)} />
              <button type="submit" disabled={actionLoading === "activate"} className="lux-action lux-action-soft rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-50">{actionLoading === "activate" ? "Se activează..." : "Activează"}</button>
            </form>
          </section>
        )}

        {profileCompletion < 100 && (
          <section className="mb-5 rounded-[2rem] border border-[var(--line)] bg-[var(--panel)] p-5 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="lux-label">Profil {profileCompletion}%</p>
                <h2 className="mt-3 font-serif text-3xl md:text-4xl">Completează profilul</h2>
                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">Când ajungi la 100%, acest panel dispare automat.</p>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--panel-strong)] md:w-64"><div className="h-full rounded-full bg-[var(--rose)]" style={{ width: `${profileCompletion}%` }} /></div>
            </div>
            <div className="mt-5 grid gap-2 md:grid-cols-2">
              {completionItems.map((item) => (
                <button key={item.label} type="button" onClick={() => setActiveTab(item.action)} className={item.done ? "rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-left text-sm text-emerald-100" : "rounded-2xl border border-[var(--line)] bg-[var(--panel-strong)] p-4 text-left text-sm text-[var(--muted)] hover:text-[var(--text)]"}>
                  {item.done ? "✓ " : "○ "}{item.label}
                </button>
              ))}
            </div>
          </section>
        )}


        <header className="account-hero-card account-enter lux-panel rounded-[2.2rem] p-5 md:rounded-[2.7rem] md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-5 sm:text-left">
              <div
                className="avatar-ring shrink-0"
                style={{ background: `conic-gradient(var(--rose-strong) ${profileCompletion * 3.6}deg, color-mix(in srgb, var(--line) 100%, transparent) 0deg)` }}
                title={`Profil ${profileCompletion}%`}
              >
                <div className="avatar-glow grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full border border-[var(--bg)] bg-[var(--panel-strong)] text-2xl font-semibold text-[var(--rose-strong)] sm:h-24 sm:w-24">
                  {profile?.avatar_url ? <img src={profile.avatar_url} alt="Profil" className="h-full w-full object-cover" /> : initials(profile?.full_name, profile?.email)}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="lux-label">Contul meu</p>
                <h1 className="editorial-title mt-2 break-words text-3xl leading-none sm:text-5xl md:text-6xl">{fullName || profile?.email?.split("@")[0] || "Cont neilzzbyanto"}</h1>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  {profile?.is_activated && (
                    <span className="verified-lux-badge" title="Cont verificat"><BadgeCheck className="h-4 w-4" /> Verificat</span>
                  )}
                  <span className="rank-lux-badge">
                    {rank.name === "Clientă elite" ? <Crown className="h-4 w-4" /> : rank.name === "Clientă VIP" ? <Gem className="h-4 w-4" /> : rank.name === "Clientă regulară" ? <Trophy className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                    {rank.name}
                  </span>
                </div>
                <p className="mt-2.5 break-anywhere text-sm text-[var(--muted)]">{profile?.email}</p>
              </div>
            </div>
            <div className="grid w-full grid-cols-3 gap-2 sm:gap-3 lg:min-w-[420px]">
              <div className="min-w-0 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-3 sm:p-4"><p className="text-[0.6rem] uppercase tracking-[.18em] text-[var(--faint)] sm:text-xs sm:tracking-[.28em]">Membră din</p><p className="mt-1.5 text-sm font-semibold sm:text-base">{formatDate(profile?.created_at)}</p></div>
              <div className="min-w-0 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-3 sm:p-4"><p className="text-[0.6rem] uppercase tracking-[.18em] text-[var(--faint)] sm:text-xs sm:tracking-[.28em]">Vizite</p><p className="mt-1.5 text-sm font-semibold sm:text-base"><CountUp value={visitCount} /></p></div>
              <div className="min-w-0 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-3 sm:p-4"><p className="text-[0.6rem] uppercase tracking-[.18em] text-[var(--faint)] sm:text-xs sm:tracking-[.28em]">Profil</p><p className="mt-1.5 text-sm font-semibold sm:text-base"><CountUp value={profileCompletion} suffix="%" /></p></div>
            </div>
          </div>
        </header>

        {/* Nav mobil: 4 principale + „Mai multe" */}
        {(() => {
          const mainIds = ["overview", "appointments", "rewards"];
          const mainInDrawer = !mainIds.includes(activeTab);
          const mainTabs = [
            { id: "overview", label: "Acasă" },
            { id: "appointments", label: "Programări" },
            { id: "rewards", label: "Rewards" },
          ];
          return (
            <div className="mt-6 grid grid-cols-4 gap-2 lg:hidden">
              {mainTabs.map((t) => (
                <button key={t.id} onClick={() => selectTab(t.id)} className={`min-h-[44px] rounded-xl border px-2 py-2 text-center text-xs font-semibold ${activeTab === t.id ? "border-[var(--rose)] bg-[var(--panel-strong)] text-[var(--text)]" : "border-[var(--line)] bg-[var(--panel)] text-[var(--muted)]"}`}>
                  {t.label}
                </button>
              ))}
              <button onClick={() => setMoreOpen(true)} className={`min-h-[44px] rounded-xl border px-2 py-2 text-center text-xs font-semibold ${mainInDrawer ? "border-[var(--rose)] bg-[var(--panel-strong)] text-[var(--text)]" : "border-[var(--line)] bg-[var(--panel)] text-[var(--muted)]"}`}>
                Mai multe
              </button>
            </div>
          );
        })()}

        <div className="mt-4 grid gap-6 lg:mt-6 lg:grid-cols-[230px_1fr] lg:items-start">
          <aside className="hidden lux-panel h-fit rounded-[2rem] p-2.5 lg:sticky lg:top-6 lg:block lg:self-start">
            <div className="grid gap-1">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={activeTab === tab.id ? "w-full rounded-xl bg-[var(--panel-strong)] px-4 py-2.5 text-left text-sm font-semibold text-[var(--text)] shadow-[inset_0_1px_0_rgba(255,255,255,.08)]" : "w-full rounded-xl px-4 py-2.5 text-left text-sm text-[var(--muted)] hover:bg-[var(--panel)] hover:text-[var(--text)]"}>
                  {tab.label}
                </button>
              ))}
            </div>
          </aside>

          <section className="min-w-0">
            {activeTab === "overview" && (
              <div className="grid items-start gap-5 xl:grid-cols-2">
                {/* Următoarea programare — două stări distincte */}
                {nextAppointment ? (
                  <section className="lux-panel h-fit rounded-[2.3rem] p-5 md:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <p className="lux-label">Următoarea programare</p>
                      <span className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-1 text-xs font-semibold text-[var(--rose-strong)]">
                        {(() => { const d = Math.ceil((new Date(nextAppointment.appointment_date + "T12:00:00").getTime() - Date.now()) / 86400000); return d <= 0 ? "astăzi" : d === 1 ? "mâine" : `în ${d} zile`; })()}
                      </span>
                    </div>
                    <h2 className="editorial-title mt-3 text-3xl sm:text-4xl">{formatDate(nextAppointment.appointment_date)}</h2>
                    <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{formatTime(nextAppointment.appointment_time)} · {nextAppointment.custom_note || nextAppointment.note || "Programare confirmată"}</p>
                    <div className="mt-5 flex flex-wrap items-center gap-2.5">
                      <span className={appointmentStatusMeta(nextAppointment).className}>{appointmentStatusMeta(nextAppointment).label}</span>
                      <button onClick={() => setActiveTab("appointments")} className="account-action-pill">Detalii</button>
                    </div>
                  </section>
                ) : (
                  <section className="lux-panel h-fit rounded-[2.3rem] p-5 md:p-6">
                    <p className="lux-label">Următoarea programare</p>
                    <div className="mt-4 flex items-start gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-[var(--line)] bg-[var(--panel-strong)] text-[var(--rose-strong)]"><CalendarDays className="h-5 w-5" /></span>
                      <div className="min-w-0">
                        <p className="font-serif text-2xl">Nicio programare activă</p>
                        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Aici apare următoarea ta programare confirmată.</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button onClick={() => setActiveTab("appointments")} className="account-action-pill">Vezi programările</button>
                      <a href="/booking" className="lux-action lux-action-soft rounded-full px-5 py-2.5 text-sm font-semibold">Solicită o programare</a>
                    </div>
                  </section>
                )}

                {/* Rank & rewards */}
                <section className="lux-panel rounded-[2.3rem] p-6 md:p-7">
                  <div className="flex items-center gap-4">
                    <span className="rank-orb shrink-0">{rank.name === "Clientă elite" ? <Crown className="h-6 w-6" /> : rank.name === "Clientă VIP" ? <Gem className="h-6 w-6" /> : rank.name === "Clientă regulară" ? <Trophy className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}</span>
                    <div className="min-w-0">
                      <p className="lux-label">Rank &amp; rewards</p>
                      <h2 className="editorial-title mt-1.5 text-3xl leading-none sm:text-4xl">{rank.name}</h2>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-[var(--muted)]">{nextReward ? `Încă ${Math.max(nextReward.visits - visitCount, 0)} vizite până la ${nextReward.label}.` : "Ai deblocat toate recompensele disponibile."}</p>
                  {nextReward && (
                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[var(--panel)]">
                      <div className="h-full rounded-full bg-[var(--rose)] transition-[width] duration-700" style={{ width: `${rewardPercent}%` }} />
                    </div>
                  )}
                  <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {rewardMilestones.map((reward) => {
                      const unlocked = visitCount >= reward.visits;
                      const isNext = nextReward?.visits === reward.visits;
                      return (
                        <div key={reward.visits} className={`rounded-2xl border p-3 ${unlocked ? "border-[color-mix(in_srgb,var(--rose)_40%,var(--line))] bg-[color-mix(in_srgb,var(--rose)_10%,var(--panel))]" : isNext ? "border-[var(--gold)]/40 bg-[var(--panel)]" : "border-[var(--line)] bg-[var(--panel)] opacity-60"}`}>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[0.58rem] uppercase tracking-[.2em] text-[var(--faint)]">{reward.visits} vizite</p>
                            {unlocked ? <BadgeCheck className="h-3.5 w-3.5 text-[var(--rose-strong)]" /> : <Lock className="h-3.5 w-3.5 text-[var(--faint)]" />}
                          </div>
                          <p className="mt-1.5 font-serif text-xl text-[var(--text)]">{reward.label}</p>
                          {isNext && <p className="mt-1 text-[0.62rem] font-bold uppercase tracking-[.16em] text-[var(--gold)]">Următoarea</p>}
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Shortcut-uri */}
                <section className="lux-panel rounded-[2.3rem] p-6 md:p-8 xl:col-span-2">
                  <p className="lux-label">Shortcut-uri</p>
                  <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
                    <button onClick={() => setActiveTab("appointments")} className="premium-tile min-h-[92px]"><CalendarDays className="h-5 w-5" /><p className="mt-2.5 font-serif text-xl sm:text-2xl">Programări</p><p className="mt-1 text-xs text-[var(--muted)] sm:text-sm">{upcomingAppointments.length} viitoare</p></button>
                    <button onClick={() => setActiveTab("rewards")} className="premium-tile min-h-[92px]"><Gift className="h-5 w-5" /><p className="mt-2.5 font-serif text-xl sm:text-2xl">Rewards</p><p className="mt-1 text-xs text-[var(--muted)] sm:text-sm">{rewards.length} carduri</p></button>
                    <button onClick={() => setActiveTab("inspirations")} className="premium-tile min-h-[92px]"><ImagePlus className="h-5 w-5" /><p className="mt-2.5 font-serif text-xl sm:text-2xl">Inspirații</p><p className="mt-1 text-xs text-[var(--muted)] sm:text-sm">{inspirations.length} salvate</p></button>
                    <button onClick={() => setActiveTab("reviews")} className="premium-tile min-h-[92px]"><Star className="h-5 w-5" /><p className="mt-2.5 font-serif text-xl sm:text-2xl">Review</p><p className="mt-1 text-xs text-[var(--muted)] sm:text-sm">{myReviews.length} trimise</p></button>
                    <button onClick={() => setActiveTab("giftcards")} className="premium-tile min-h-[92px]"><Gift className="h-5 w-5" /><p className="mt-2.5 font-serif text-xl sm:text-2xl">Carduri cadou</p><p className="mt-1 text-xs text-[var(--muted)] sm:text-sm">{giftCards.length} carduri</p></button>
                    <button onClick={() => setActiveTab("notifications")} className="premium-tile min-h-[92px]"><Bell className="h-5 w-5" /><p className="mt-2.5 font-serif text-xl sm:text-2xl">Notificări</p><p className="mt-1 text-xs text-[var(--muted)] sm:text-sm">{notifications.length} recente</p></button>
                  </div>
                </section>
                <section className="lux-panel rounded-[2.3rem] p-6 md:p-8 xl:col-span-2">
                  <p className="lux-label">Theme Engine</p>
                  <h2 className="editorial-title mt-3 text-4xl">Tema ta personală</h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">Schimbă instant dark/light din butonul de sus sau alege o culoare premium pentru contul tău.</p>
                  <button onClick={() => setActiveTab("appearance")} className="lux-action lux-action-soft mt-5 rounded-full px-5 py-3 text-sm font-semibold">Alege culoarea</button>
                </section>
              </div>
            )}

            {activeTab === "profile" && (
              <section className="lux-panel rounded-[2.3rem] p-6 md:p-8">
                <p className="lux-label">Profil</p>
                <h2 className="editorial-title mt-3 text-5xl">Edit profile</h2>
                <form onSubmit={saveProfil} className="mt-6 space-y-4">
                  <input className="lux-input" placeholder="Nume afișat" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  <label className="block rounded-2xl border border-dashed border-[var(--line)] bg-[var(--panel)] p-4 text-sm text-[var(--muted)]"><span className="mb-2 flex items-center gap-2 text-[var(--text)]"><Upload className="h-4 w-4" /> Upload profile photo</span><input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} /></label>
                  <button type="submit" disabled={actionLoading === "profile"} className="lux-action lux-action-soft rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-50">{actionLoading === "profile" ? "Saving..." : "Save profile"}</button>
                </form>
              </section>
            )}

            {activeTab === "appointments" && (
              <section className="lux-panel rounded-[2.3rem] p-6 md:p-8">
                <p className="lux-label">Programări</p><h2 className="editorial-title mt-3 text-5xl">Programările mele</h2>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">Programările viitoare sunt separate de istoric și primesc status corect, nu toate galbene.</p>
                <div className="mt-7 grid gap-4">
                  {upcomingAppointments.map((item) => {
                    const meta = appointmentStatusMeta(item);
                    return (
                      <article key={item.id} className="appointment-card appointment-card-next w-full min-w-0 max-w-full">
                        <div className="flex flex-wrap items-center justify-between gap-2"><p className="min-w-0 break-words font-serif text-2xl sm:text-3xl">{formatDate(item.appointment_date)} · {formatTime(item.appointment_time)}</p><span className={`${meta.className} shrink-0`}>{meta.label}</span></div>
                        {(item.custom_note || item.note) && <p className="mt-3 break-words text-sm leading-7 text-[var(--muted)]">{item.custom_note || item.note}</p>}
                      </article>
                    );
                  })}
                  {upcomingAppointments.length === 0 && (
                    <EmptyState icon={<CalendarDays className="h-5 w-5" />} title="Nicio programare viitoare" text="Solicită o programare pe Instagram și va apărea aici după confirmare." actionLabel="Solicită o programare" onAction={() => { window.location.href = "/booking"; }} />
                  )}
                </div>
                {pastAppointments.length > 0 && (
                  <div className="mt-9">
                    <p className="lux-label">Istoric</p>
                    <div className="mt-4 grid gap-3">
                      {pastAppointments.map((item) => {
                        const meta = appointmentStatusMeta(item);
                        return (
                          <article key={item.id} className="appointment-card w-full min-w-0 max-w-full opacity-75">
                            <div className="flex flex-wrap items-center justify-between gap-2"><p className="min-w-0 break-words font-serif text-xl sm:text-2xl">{formatDate(item.appointment_date)} · {formatTime(item.appointment_time)}</p><span className={`${meta.className} shrink-0`}>{meta.label}</span></div>
                            {(item.custom_note || item.note) && <p className="mt-2 break-words text-sm text-[var(--muted)]">{item.custom_note || item.note}</p>}
                          </article>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>
            )}

            {activeTab === "rewards" && (
              <section className="lux-panel rounded-[2.3rem] p-6 md:p-8">
                <p className="lux-label">Rewards</p><h2 className="editorial-title mt-3 text-5xl">Progres reward</h2><p className="mt-4 text-sm text-[var(--muted)]">{nextReward ? `Încă ${Math.max(nextReward.visits - visitCount, 0)} vizite până la ${nextReward.label}.` : "Ai deblocat toate recompensele disponibile."}</p>
                <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-center"><div className="relative grid h-32 w-32 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(var(--rose-strong) ${rewardPercent}%, rgba(255,255,255,.08) 0)` }}><div className="grid h-[6.6rem] w-[6.6rem] place-items-center rounded-full bg-[var(--bg)] text-3xl font-semibold">{rewardPercent}%</div></div><div className="flex-1"><div className="h-3 overflow-hidden rounded-full bg-[var(--panel)]"><div className="h-full rounded-full bg-[var(--rose)]" style={{ width: `${rewardPercent}%` }} /></div><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{rewardMilestones.map((item) => { const unlocked = visitCount >= item.visits; return <div key={item.visits} className={unlocked ? "reward-milestone reward-milestone-unlocked" : "reward-milestone"}><div className="flex items-center justify-between gap-3"><p className="lux-label">{item.visits} vizite</p>{unlocked ? <BadgeCheck className="h-4 w-4 text-[var(--rose-strong)]" /> : <Lock className="h-4 w-4 text-[var(--faint)]" />}</div><p className="mt-3 font-serif text-3xl">{item.label}</p><p className="mt-2 text-xs text-[var(--muted)]">{unlocked ? "Deblocat" : `${item.visits - visitCount} vizite rămase`}</p></div>; })}</div></div></div>
                <div className="mt-7 grid gap-4 lg:grid-cols-[1fr_.8fr]">
                  <div className="rounded-[1.8rem] border border-[var(--line)] bg-[var(--panel)] p-5">
                    <p className="lux-label">Deblocate acum</p>
                    <div className="mt-4 flex flex-wrap gap-2">{completedRewards.length > 0 ? completedRewards.map((item) => <span key={item.visits} className="rounded-full border border-[var(--rose)]/35 bg-[var(--rose)]/10 px-3 py-2 text-xs font-semibold text-[var(--rose-strong)]">{item.label}</span>) : <span className="text-sm text-[var(--muted)]">Încă nu ai reward deblocat.</span>}</div>
                  </div>
                  <div className="rounded-[1.8rem] border border-[var(--line)] bg-[var(--panel)] p-5">
                    <p className="lux-label">Următoarele</p>
                    <div className="mt-4 space-y-2">{lockedRewards.slice(0, 3).map((item) => <div key={item.visits} className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--panel-strong)] px-4 py-3 text-sm"><span>{item.label}</span><span className="text-[var(--faint)]">{item.visits} vizite</span></div>)}{lockedRewards.length === 0 && <span className="text-sm text-[var(--muted)]">Toate reward-urile sunt deblocate.</span>}</div>
                  </div>
                </div>
                <button onClick={generateReward} disabled={!canGenerateReward} className="lux-action lux-action-soft mt-6 rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-45">Generează voucher</button>
                <div className="mt-5 grid gap-3 md:grid-cols-2">{rewards.map((reward) => <div key={reward.id} className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4"><p className="text-xs uppercase tracking-[.26em] text-[var(--faint)]">Reward #{reward.reward_number}</p><p className="mt-2 font-semibold">{reward.code}</p><p className="mt-1 text-sm text-[var(--muted)]">{reward.status} · {rewardForNumber(reward.reward_number).label}</p><button onClick={() => downloadVoucher(reward)} className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2 text-sm"><Download className="h-4 w-4" /> Descarcă PNG</button></div>)}</div>
              </section>
            )}

            {activeTab === "giftcards" && (
              <section className="lux-panel rounded-[2.3rem] p-6 md:p-8">
                <p className="lux-label">Carduri cadou</p>
                <h2 className="editorial-title mt-3 text-5xl">Cardurile tale cadou</h2>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">Cardurile cadou asociate contului tău apar aici. Le poți descărca oricând.</p>

                {giftCards.length === 0 ? (
                  <div className="mt-8 grid place-items-center rounded-[2rem] border border-dashed border-[var(--line)] bg-[var(--panel)] p-10 text-center">
                    <span className="grid h-16 w-16 place-items-center rounded-2xl border border-[var(--line)] bg-[var(--panel-strong)] text-[var(--rose-strong)]"><Gift className="h-7 w-7" /></span>
                    <p className="mt-5 font-serif text-3xl">Niciun card cadou încă</p>
                    <p className="mt-2 max-w-md text-sm text-[var(--muted)]">Vrei să oferi sau să primești un card cadou neilzzbyanto? Descoperă cum funcționează.</p>
                    <Link href="/gift-card" className="lux-action lux-action-soft mt-6 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"><Gift className="h-4 w-4" /> Vezi cardurile cadou</Link>
                  </div>
                ) : (
                  <div className="mt-7 grid gap-4 md:grid-cols-2">
                    {giftCards.map((card) => {
                      const statusClass = card.status === "active" ? "status-available" : card.status === "used" ? "status-completed" : card.status === "expired" ? "status-full" : "status-limited";
                      const statusLabel = card.status === "active" ? "Activ" : card.status === "used" ? "Folosit" : card.status === "expired" ? "Expirat" : "Anulat";
                      return (
                        <article key={card.id} className="appointment-card">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="lux-label">{card.recipient_name || "Card cadou"}</p>
                              <p className="mt-2 font-serif text-4xl">{card.amount} lei</p>
                            </div>
                            <span className={`status-pill mt-0 ${statusClass}`}>{statusLabel}</span>
                          </div>
                          {card.message && <p className="mt-3 text-sm italic leading-6 text-[var(--muted)]">“{card.message}”</p>}
                          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[var(--faint)]">
                            <span>Cod: <span className="font-mono text-[var(--muted)]">{card.code}</span></span>
                            <span>Emis: {card.issued_at || "—"}</span>
                            <span>Expiră: {card.expires_at || "—"}</span>
                          </div>
                          <button onClick={() => downloadGiftCard(card)} className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold"><Download className="h-4 w-4" /> Descarcă cardul</button>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {activeTab === "inspirations" && (
              <section className="lux-panel rounded-[2.3rem] p-6 md:p-8">
                <p className="lux-label">Inspirațiile mele</p><h2 className="editorial-title mt-3 text-5xl">Board privat</h2><p className="mt-4 text-sm leading-7 text-[var(--muted)]">Apasă pe cardul cu plus ca să adaugi o poză. Antonia le vede în dashboard înainte de programare.</p>
                <form onSubmit={uploadInspiration} className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <label className="group grid aspect-square cursor-pointer place-items-center rounded-[2rem] border border-dashed border-[var(--line)] bg-[var(--panel)] p-6 text-center transition hover:bg-[var(--panel-strong)]">
                    <input className="hidden" type="file" accept="image/*" onChange={(e) => setInspirationFile(e.target.files?.[0] || null)} />
                    <div><ImagePlus className="mx-auto h-9 w-9 text-[var(--rose-strong)]" /><p className="mt-4 font-serif text-3xl">Adaugă poză</p><p className="mt-2 text-sm text-[var(--muted)]">{inspirationFile ? inspirationFile.name : "Alege imaginea"}</p></div>
                  </label>
                  <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--panel)] p-4 sm:col-span-1 lg:col-span-2"><input className="lux-input" placeholder="Titlu opțional" value={inspirationTitle} onChange={(e) => setInspirationTitle(e.target.value)} /><textarea className="lux-input mt-3 min-h-28 resize-none" placeholder="Notițe opționale: formă, culoare, lungime..." value={inspirationNote} onChange={(e) => setInspirationNote(e.target.value)} /><button type="submit" disabled={actionLoading === "inspiration"} className="lux-action lux-action-soft mt-3 rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-45">{actionLoading === "inspiration" ? "Se încarcă..." : "Salvează inspirația"}</button></div>
                  {inspirations.map((item) => <article key={item.id} className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--panel)] p-3"><button type="button" onClick={() => setFullscreenInspiration(item)} className="block w-full overflow-hidden rounded-[1.35rem]"><img src={item.image_url} alt={item.title || "Inspiration"} className="aspect-square w-full object-cover transition duration-500 hover:scale-105" /></button><div className="p-3"><div className="flex items-center justify-between gap-3"><span className="text-xs uppercase tracking-[.24em] text-[var(--rose-strong)]">{item.source_type === "gallery" ? "Salvată din galerie" : "Încărcată de tine"}</span><button type="button" onClick={() => deleteInspiration(item)} className="text-[var(--faint)] hover:text-red-300"><Trash2 className="h-4 w-4" /></button></div><p className="mt-2 font-serif text-2xl">{item.title || "Inspirație"}</p><p className="mt-1 text-xs text-[var(--faint)]">Adăugată {formatDate(item.created_at)}</p>{item.note && <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{item.note}</p>}</div></article>)}
                </form>
              </section>
            )}

            {activeTab === "reviews" && (
              <section className="lux-panel rounded-[2.3rem] p-6 md:p-8">
                <p className="lux-label">Review-uri</p><h2 className="editorial-title mt-3 text-5xl">Lasă review</h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">Scrie review-ul tău și adaugă o poză opțională. Review-ul apare public doar după aprobare.</p>
                {!profile?.is_activated && <div className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 text-sm leading-7 text-[var(--muted)]">Contul trebuie activat de Antonia înainte să poți trimite review verificat.</div>}
                <form onSubmit={submitReview} className="mt-6 grid gap-4 lg:grid-cols-[1fr_.72fr]">
                  <div className="space-y-4">
                    <select className="lux-input" value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))} disabled={!profile?.is_activated}>
                      {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} stele</option>)}
                    </select>
                    <textarea className="lux-input min-h-36 resize-none" placeholder="Scrie review-ul tău..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} disabled={!profile?.is_activated} />
                    <label className="block rounded-2xl border border-dashed border-[var(--line)] bg-[var(--panel)] p-4 text-sm text-[var(--muted)]">
                      <span className="mb-2 block text-[var(--text)]">Upload poză opțională</span>
                      <input type="file" accept="image/*" disabled={!profile?.is_activated} onChange={(e) => setReviewFile(e.target.files?.[0] || null)} />
                    </label>
                    <button type="submit" disabled={!profile?.is_activated || actionLoading === "review"} className="lux-action lux-action-soft rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-45">{actionLoading === "review" ? "Se trimite..." : "Trimite review"}</button>
                  </div>
                  <div className="rounded-[1.7rem] border border-[var(--line)] bg-[var(--panel)] p-4">
                    <p className="lux-label">Preview poză</p>
                    {reviewPreviewUrl ? <img src={reviewPreviewUrl} alt="Preview review" className="mt-4 aspect-[4/3] w-full rounded-[1.25rem] object-cover" /> : <div className="mt-4 grid aspect-[4/3] place-items-center rounded-[1.25rem] border border-dashed border-[var(--line)] text-sm text-[var(--faint)]">Nicio poză selectată</div>}
                  </div>
                </form>
                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  {myReviews.length === 0 && (
                    <EmptyState icon={<Star className="h-5 w-5" />} title="Niciun review trimis" text="După o ședință poți lăsa un review verificat cu poză opțională." />
                  )}
                  {myReviews.map((review) => <article key={review.id} className="rounded-[1.7rem] border border-[var(--line)] bg-[var(--panel)] p-5">{review.photo_url && <img src={review.photo_url} alt="Review" className="mb-4 aspect-[4/3] w-full rounded-[1.25rem] object-cover" />}<div className="flex items-center justify-between gap-3"><p className="text-sm text-[var(--rose-strong)]">{"★".repeat(review.rating || 5)}</p><span className={review.is_approved ? "status-pill status-available mt-0" : "status-pill status-limited mt-0"}>{review.is_approved ? "Publicat" : "În așteptare"}</span></div><p className="mt-4 text-sm leading-7 text-[var(--muted)]">“{review.text}”</p><p className="mt-3 text-xs text-[var(--faint)]">{formatDate(review.created_at)}</p></article>)}
                  {myReviews.length === 0 && <div className="rounded-[1.7rem] border border-[var(--line)] bg-[var(--panel)] p-5 text-sm leading-7 text-[var(--muted)]">Nu ai lăsat încă niciun review.</div>}
                </div>
              </section>
            )}

            {activeTab === "notifications" && (
              <section className="lux-panel rounded-[2.3rem] p-5 md:p-8">
                <p className="lux-label">Notificări</p>
                <h2 className="editorial-title mt-3 text-4xl md:text-5xl">Notificări push</h2>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className={pushDiag.supabaseSub ? "status-pill status-available mt-0" : "status-pill status-full mt-0"}>
                    {pushDiag.supabaseSub ? "Push activ pe acest dispozitiv" : "Push inactiv"}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={enableNotificări} disabled={actionLoading === "notifications"} className="lux-action lux-action-soft rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-50"><Bell className="mr-2 inline h-4 w-4" /> {actionLoading === "notifications" ? "Se activează..." : "Activează notificările"}</button>
                  <button type="button" onClick={reregisterDevice} disabled={actionLoading === "reregister"} className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-5 py-3 text-sm font-semibold disabled:opacity-50">{actionLoading === "reregister" ? "Se reînregistrează..." : "Reînregistrează dispozitivul"}</button>
                  <button type="button" onClick={testNotification} className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2.5 text-sm font-semibold">Test local</button>
                  <button type="button" onClick={testRealPush} disabled={actionLoading === "test-real"} className="rounded-full border border-[var(--line)] bg-[var(--text)] px-4 py-2.5 text-sm font-semibold text-[var(--bg)] disabled:opacity-50">{actionLoading === "test-real" ? "Se testează..." : "Testează Push real"}</button>
                </div>
                <p className="mt-2 text-xs leading-5 text-[var(--faint)]"><b>Test local</b> verifică permisiunea și service worker-ul. <b>Testează Push real</b> verifică trimiterea completă server → dispozitiv.</p>

                {/* Diagnostic push complet */}
                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                  {[
                    { label: "Context securizat", ok: pushDiag.secureContext, value: pushDiag.secureContext ? "da" : "nu" },
                    { label: "Origine", ok: true, value: pushDiag.origin || "—" },
                    { label: "Permisiune", ok: pushDiag.permission === "granted", value: pushDiag.permission },
                    { label: "Service Worker", ok: pushDiag.sw, value: pushDiag.sw ? `activ (${pushDiag.swVersion})` : "inactiv" },
                    { label: "Subscription browser", ok: pushDiag.browserSub, value: pushDiag.browserSub ? "activ" : "lipsă" },
                    { label: "Subscription Supabase", ok: pushDiag.supabaseSub, value: pushDiag.supabaseSub ? "salvat" : "lipsă" },
                    { label: "Endpoint", ok: pushDiag.browserSub, value: pushDiag.endpointPreview },
                    { label: "Dispozitiv detectat", ok: true, value: pushDiag.device },
                    { label: "Cheie VAPID publică", ok: pushDiag.vapid, value: pushDiag.vapid ? "configurată" : "lipsă" },
                    { label: "Ultimul test local", ok: pushDiag.lastLocalTest !== "—", value: pushDiag.lastLocalTest },
                    { label: "Ultimul Push real", ok: pushDiag.lastRealTest !== "—", value: pushDiag.lastRealTest },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-4 py-2.5 text-sm">
                      <span className="min-w-0 shrink-0 text-[var(--muted)]">{row.label}</span>
                      <span className={`min-w-0 truncate text-right font-semibold ${row.ok ? "text-emerald-300" : "text-[var(--rose-strong)]"}`}>{row.value}</span>
                    </div>
                  ))}
                  {pushDiag.lastError && (
                    <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-sm sm:col-span-2">
                      <span className="text-[var(--faint)]">Ultima eroare: </span><span className="text-[var(--rose-strong)]">{pushDiag.lastError}</span>
                    </div>
                  )}
                </div>

                {/* Lista dispozitivelor proprii */}
                <div className="mt-6">
                  <p className="lux-label">Dispozitivele tale</p>
                  {pushDevices.length === 0 ? (
                    <p className="mt-3 text-sm text-[var(--muted)]">Niciun dispozitiv înregistrat pentru push.</p>
                  ) : (
                    <div className="mt-3 grid gap-2">
                      {pushDevices.map((d) => (
                        <div key={d.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3">
                          <div className="min-w-0">
                            <p className="font-semibold">{detectDevice(d.user_agent)}</p>
                            <p className="mt-0.5 text-xs text-[var(--faint)]">{endpointPreview(d.endpoint)} · înregistrat {formatDate(d.created_at)}</p>
                          </div>
                          <button type="button" onClick={() => removeDevice(d)} disabled={actionLoading === "remove-device"} className="shrink-0 rounded-full border border-[#e0808f]/40 bg-[#e0808f]/10 px-4 py-2 text-xs font-semibold text-[#f0b7c0] disabled:opacity-50">Elimină</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6"><PwaInstallCard /></div>

                <div className="mt-7 space-y-4">
                  {notifications.length === 0 && (
                    <EmptyState icon={<Bell className="h-5 w-5" />} title="Nicio notificare" text="Aici apar actualizările și reminderele de la Antonia." />
                  )}
                  {notifications.map((item, index) => <div key={item.id} className="grid gap-3 md:grid-cols-[80px_1fr]"><div className="text-xs uppercase tracking-[.22em] text-[var(--faint)]">{index === 0 ? "Recent" : formatDate(item.created_at)}</div><div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5"><p className="lux-label">{item.status || "in-app"}</p><p className="mt-2 font-serif text-2xl md:text-3xl">{item.title}</p><p className="mt-2 text-sm leading-7 text-[var(--muted)]">{item.message}</p></div></div>)}</div>
              </section>
            )}


            {activeTab === "appearance" && (
              <section className="lux-panel rounded-[2.3rem] p-6 md:p-8">
                <p className="lux-label">Theme Engine</p>
                <h2 className="editorial-title mt-3 text-5xl">Tema contului tău</h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">Alege vibe-ul care îți place. Se salvează pe dispozitivul tău și se aplică instant, fără să afecteze alte cliente sau dashboard-ul Antoniei.</p>
                <div className="mt-7 grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 xl:grid-cols-4">
                  {accentOptions.map((option) => {
                    const active = selectedAccent === option.value;
                    return (
                      <button
                        type="button"
                        key={option.value}
                        onClick={() => changeAccent(option.value)}
                        aria-pressed={active}
                        className={`flex h-full min-w-0 flex-col rounded-[1.3rem] border p-3.5 text-left transition sm:p-4 ${active ? "border-[var(--rose)] bg-[var(--panel-strong)] shadow-[0_0_28px_color-mix(in_srgb,var(--rose)_16%,transparent)]" : "border-[var(--line)] bg-[var(--panel)] hover:border-[color-mix(in_srgb,var(--rose)_40%,var(--line))]"}`}
                      >
                        <span className="flex items-start gap-2">
                          <span
                            className="mt-1.5 inline-block h-3 w-3 shrink-0 rounded-full ring-1 ring-[var(--line)]"
                            style={{ background: option.swatch, boxShadow: `0 0 12px ${option.swatch}66` }}
                          />
                          <span className="min-w-0 flex-1 break-words font-serif text-xl leading-tight text-[var(--text)] sm:text-2xl">{option.label}</span>
                        </span>
                        <span className="mt-2 line-clamp-2 text-[0.72rem] leading-4 text-[var(--muted)] sm:text-xs sm:leading-5">{option.description}</span>
                        {active && (
                          <span className="mt-auto pt-3 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[var(--rose-strong)]">● Activă</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {activeTab === "security" && (
              <section className="lux-panel rounded-[2.3rem] p-6 md:p-8"><p className="lux-label">Securitate</p><h2 className="editorial-title mt-3 text-5xl">Parolă</h2><div className="mt-6 grid gap-3 md:grid-cols-[1fr_1fr_auto]"><button type="button" onClick={sendResetEmail} disabled={actionLoading === "reset"} className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-5 py-3 text-sm font-semibold disabled:opacity-50">Trimite email resetare</button><div className="relative"><input className="lux-input pr-12" type={showParolă ? "text" : "password"} placeholder="Parolă nouă" value={newParolă} onChange={(e) => setNewParolă(e.target.value)} /><button type="button" onClick={() => setShowParolă(!showParolă)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"><KeyRound className="h-4 w-4" /></button></div><button type="button" onClick={updateParolă} disabled={actionLoading === "password"} className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-5 py-3 text-sm font-semibold disabled:opacity-50">Actualizează</button></div></section>
            )}
          </section>
        </div>
      </div>

      {fullscreenInspiration && <div className="fixed inset-0 z-[115] bg-black/90 p-4 backdrop-blur-xl" onClick={() => setFullscreenInspiration(null)}><div className="mx-auto flex h-full max-w-5xl flex-col justify-center"><button type="button" onClick={() => setFullscreenInspiration(null)} className="mb-4 self-end rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white">Închide</button><img src={fullscreenInspiration.image_url} alt={fullscreenInspiration.title || "Inspirație"} className="max-h-[78vh] w-full rounded-[2rem] object-contain" />{(fullscreenInspiration.title || fullscreenInspiration.note) && <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/10 p-4 text-white"><p className="font-serif text-3xl">{fullscreenInspiration.title || "Inspirație"}</p>{fullscreenInspiration.note && <p className="mt-2 text-sm leading-7 text-white/70">{fullscreenInspiration.note}</p>}</div>}</div></div>}

      {/* Bottom sheet „Mai multe" (doar mobil) */}
      {moreOpen && (
        <div className="fixed inset-0 z-[118] lg:hidden" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="absolute inset-x-0 bottom-0 max-h-[80dvh] overflow-y-auto rounded-t-[1.8rem] border-t border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_94%,transparent)] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[var(--line)]" />
            <p className="lux-label px-1">Mai multe secțiuni</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {tabs.filter((t) => !["overview", "appointments", "rewards"].includes(t.id)).map((t) => (
                <button key={t.id} onClick={() => selectTab(t.id)} className={`min-h-[48px] rounded-xl border px-3 py-2.5 text-left text-sm font-semibold ${activeTab === t.id ? "border-[var(--rose)] bg-[var(--panel-strong)] text-[var(--text)]" : "border-[var(--line)] bg-[var(--panel)] text-[var(--muted)]"}`}>
                  {t.label}
                </button>
              ))}
            </div>
            <button onClick={() => setMoreOpen(false)} className="mt-3 w-full rounded-full border border-[var(--line)] bg-[var(--panel)] py-3 text-sm font-semibold">Închide</button>
          </div>
        </div>
      )}

      {guideOpen && <div className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-5 backdrop-blur-xl"><div className="lux-panel max-w-xl rounded-[2.4rem] p-7"><p className="lux-label">Ghid rapid</p><h2 className="editorial-title mt-3 text-5xl">Bine ai venit la neilzzbyanto</h2><div className="mt-6 space-y-4 text-sm leading-7 text-[var(--muted)]"><p><b>Inspirațiile mele:</b> salvează modele din galerie sau încarcă pozele tale.</p><p><b>Rewards & Rank:</b> urmărește progresul și descarcă voucher PNG.</p><p><b>Programări:</b> vezi următoarea programare și istoricul tău.</p><p><b>Notificări:</b> activează reminderele pentru programări și updates.</p><p><b>Review-uri:</b> după activare poți lăsa review verificat cu poză opțională.</p></div><button onClick={() => setGuideOpen(false)} className="lux-action lux-action-soft mt-7 rounded-full px-5 py-3 text-sm font-semibold">Am înțeles</button></div></div>}
    </main>
  );
}
