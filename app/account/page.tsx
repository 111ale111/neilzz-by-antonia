"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  CheckCircle2,
  Download,
  Gift,
  ImagePlus,
  KeyRound,
  LogOut,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PwaInstallCard } from "@/components/pwa-install-card";

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
};

const accentOptions: AccentOption[] = [
  { value: "rose-gold", label: "Rose Gold", description: "Luxury roz auriu, default neilzzbyanto." },
  { value: "champagne", label: "Champagne", description: "Cald, elegant, ivory/gold." },
  { value: "mocha", label: "Mocha", description: "Maro premium, soft și cozy." },
  { value: "sapphire", label: "Sapphire", description: "Albastru rece, editorial." },
  { value: "amethyst", label: "Amethyst", description: "Mov luxury, glossy." },
];

function safeAccent(value?: string | null) {
  return accentOptions.some((item) => item.value === value) ? value! : "rose-gold";
}

const rankMap = [
  { name: "Clientă nouă", min: 0, next: 5, mark: "○", benefits: ["Cont privat neilzzbyanto", "Inspirațiile mele", "Istoric programări"] },
  { name: "Clientă regulară", min: 5, next: 10, mark: "✦", benefits: ["10% off la reward #1", "Review verificat", "Rank afișat lângă review"] },
  { name: "Clientă VIP", min: 10, next: 15, mark: "◇", benefits: ["25% off la reward #2", "Prioritate la programări", "Badge VIP în review-uri"] },
  { name: "Clientă elite", min: 15, next: null, mark: "✧◇✧", benefits: ["50% off la reward #3", "Nivel premium", "Badge Elite în review-uri"] },
];

function getRank(visits: number) {
  if (visits >= 15) return rankMap[3];
  if (visits >= 10) return rankMap[2];
  if (visits >= 5) return rankMap[1];
  return rankMap[0];
}

function discountForRewardNumber(rewardNumber: number) {
  if (rewardNumber <= 1) return 10;
  if (rewardNumber === 2) return 25;
  return 50;
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

export default function AccountPage() {
  const supabase = createClient();
  const [profile, setProfil] = useState<Profil | null>(null);
  const [appointments, setProgramări] = useState<Appointment[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [inspirations, setInspirații] = useState<Inspiration[]>([]);
  const [notifications, setNotificări] = useState<NotificationItem[]>([]);
  const [myReviews, setMyReviews] = useState<MyReview[]>([]);
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
      supabase.from("client_rewards").select("id,code,reward_number,status,issued_at").eq("client_id", activeProfilId).order("issued_at", { ascending: false }),
      supabase.from("client_inspirations").select("id,image_url,title,note,source_type,created_at").eq("client_id", activeProfilId).order("created_at", { ascending: false }),
      supabase.from("client_notifications").select("id,title,message,status,created_at,read_at").eq("client_id", activeProfilId).order("created_at", { ascending: false }).limit(10),
      supabase.from("reviews").select("id,rating,text,is_approved,is_featured,photo_url,created_at").eq("user_id", activeProfilId).order("created_at", { ascending: false }),
    ]);

    if (appointmentRes.data) setProgramări(appointmentRes.data as Appointment[]);
    if (rewardRes.data) setRewards(rewardRes.data as Reward[]);
    if (inspirationRes.data) setInspirații(inspirationRes.data as Inspiration[]);
    if (notificationRes.data) setNotificări(notificationRes.data as NotificationItem[]);
    if (reviewRes.data) setMyReviews(reviewRes.data as MyReview[]);
    setLoading(false);
  }

  useEffect(() => {
    loadAccount();
  }, []);

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
    setSelectedAccent(nextAccent);
    window.localStorage.setItem("neilzz-accent", nextAccent);
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
    const earned = Math.floor(visits / 5);
    const activeCount = rewards.length;
    if (earned <= activeCount) {
      setMessage("Nu ai reward nou disponibil încă.");
      return;
    }
    const rewardNumber = activeCount + 1;
    const discount = discountForRewardNumber(rewardNumber);
    const codeValue = `NB-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const { error: rewardError } = await supabase.from("client_rewards").insert({
      client_id: profile.id,
      reward_number: rewardNumber,
      code: codeValue,
      reward_type: `${discount}% off`,
      status: "active",
    });
    if (rewardError) {
      setMessage(rewardError.message);
      return;
    }
    await supabase.from("client_notifications").insert({ client_id: profile.id, title: "Reward disponibil", message: `Ai deblocat Reward #${rewardNumber}: ${discount}% off.`, type: "reward" });
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
    ctx.fillText(`${discountForRewardNumber(reward.reward_number)}% OFF`, 600, 565);
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
    const registration = await navigator.serviceWorker.register("/sw.js?v=19", { scope: "/" });
    await navigator.serviceWorker.ready;
    return registration;
  }

  async function enableNotificări() {
    if (!profile) return;
    setActionLoading("notifications");
    let permission = "unsupported";
    try {
      if (typeof window !== "undefined" && "Notification" in window) {
        permission = await Notification.requestPermission();
        await getNotificationRegistration();
      }
      const { error } = await supabase.from("profiles").update({ notification_permission: permission }).eq("id", profile.id);
      setMessage(error ? error.message : permission === "granted" ? "Notificările sunt permise pe acest dispozitiv. Apasă Test 8 secunde și blochează telefonul." : "Notificările nu sunt active în browser.");
      await loadAccount();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Notificările nu au putut fi activate.");
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
          icon: "/icon-192.png?v=19",
          badge: "/icon-192.png?v=19",
          tag: `neilzz-test-${Date.now()}`,
        });
      } else {
        new Notification("Test neilzzbyanto", { body: "Notificările simple merg." });
      }
      setMessage("Notificare test trimisă. Pe iPhone poate apărea în Notification Center dacă aplicația este deschisă.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Notificarea test nu a putut fi trimisă.");
    }
  }

  async function testDelayedNotification() {
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
      await getNotificationRegistration();
      setMessage("Test programat în 8 secunde. Pune aplicația în background sau blochează telefonul.");
      window.setTimeout(async () => {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification("Reminder test neilzzbyanto", {
          body: "Acesta este testul după 8 secunde. Așa vor funcționa reminderele.",
          icon: "/icon-192.png?v=19",
          badge: "/icon-192.png?v=19",
          tag: `neilzz-delayed-${Date.now()}`,
        });
      }, 8000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Testul programat nu a putut fi trimis.");
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
  const rewardProgress = visitCount % 5;
  const rewardPercent = Math.min(100, Math.round((rewardProgress / 5) * 100));
  const rewardsEarned = Math.floor(visitCount / 5);
  const canGenerateReward = rewardsEarned > rewards.length;
  const nextAppointment = appointments.filter((item) => item.status === "upcoming").sort((a, b) => a.appointment_date.localeCompare(b.appointment_date))[0];
  const completionItems = [
    Boolean(profile?.full_name),
    Boolean(profile?.avatar_url),
    Boolean(profile?.is_activated),
    inspirations.length > 0,
    notifications.length > 0 || profile?.notification_permission === "granted",
  ];
  const profileCompletion = Math.round((completionItems.filter(Boolean).length / completionItems.length) * 100);

  if (loading) return <main className="grid min-h-screen place-items-center bg-[var(--bg)] text-[var(--text)]">Se încarcă...</main>;

  const tabs = [
    { id: "overview", label: "Acasă" },
    { id: "profile", label: "Profil" },
    { id: "appointments", label: "Programări" },
    { id: "rewards", label: "Rewards" },
    { id: "inspirations", label: "Inspirații" },
    { id: "reviews", label: "Review-uri" },
    { id: "notifications", label: "Notificări" },
    { id: "appearance", label: "Temă" },
    { id: "security", label: "Securitate" },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--bg)] px-5 py-8 text-[var(--text)] md:px-8">
      <div className="lux-noise" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-3">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm text-[var(--muted)]"><ArrowLeft className="h-4 w-4" /> Home</Link>
          <div className="flex flex-wrap justify-end gap-2">
            {profile?.role === "admin" && <Link href="/dashboard" className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold">Dashboard</Link>}
            <button onClick={() => setGuideOpen(true)} className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold">Ghid rapid</button>
            <button onClick={logout} className="logout-lux inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold"><LogOut className="h-4 w-4" /> Logout</button>
          </div>
        </div>

        {(message || resetEmailMessage) && (
          <div className="mb-5 rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-5 py-4 text-sm text-[var(--rose-strong)]">{message || resetEmailMessage}</div>
        )}

        <header className="lux-panel rounded-[2.7rem] p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-full border border-[var(--line)] bg-[var(--panel-strong)] text-2xl font-semibold text-[var(--rose-strong)]">
                {profile?.avatar_url ? <img src={profile.avatar_url} alt="Profil" className="h-full w-full object-cover" /> : initials(profile?.full_name, profile?.email)}
              </div>
              <div>
                <p className="lux-label">Contul meu</p>
                <h1 className="editorial-title mt-2 text-5xl leading-none md:text-6xl">{fullName || profile?.email?.split("@")[0] || "Cont neilzzbyanto"}</h1>
                <p className="mt-2 text-sm text-[var(--muted)]">{profile?.email}</p>
                <span className="mt-3 inline-flex rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-1 text-xs uppercase tracking-[.22em] text-[var(--rose-strong)]">{rank.mark} {rank.name}</span>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4"><p className="text-xs uppercase tracking-[.28em] text-[var(--faint)]">Membră din</p><p className="mt-2 font-semibold">{formatDate(profile?.created_at)}</p></div>
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4"><p className="text-xs uppercase tracking-[.28em] text-[var(--faint)]">Vizite</p><p className="mt-2 font-semibold">{visitCount}</p></div>
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4"><p className="text-xs uppercase tracking-[.28em] text-[var(--faint)]">Profil</p><p className="mt-2 font-semibold">{profileCompletion}%</p></div>
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[250px_1fr]">
          <aside className="lux-panel h-fit rounded-[2rem] p-3">
            <div className="grid gap-2">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={activeTab === tab.id ? "rounded-2xl bg-[var(--panel-strong)] px-4 py-3 text-left text-sm font-semibold text-[var(--text)]" : "rounded-2xl px-4 py-3 text-left text-sm text-[var(--muted)] hover:bg-[var(--panel)] hover:text-[var(--text)]"}>
                  {tab.label}
                </button>
              ))}
            </div>
          </aside>

          <section className="min-w-0">
            {activeTab === "overview" && (
              <div className="grid gap-5 xl:grid-cols-2">
                <section className="lux-panel rounded-[2.3rem] p-6 md:p-8">
                  <p className="lux-label">Next appointment</p>
                  <h2 className="editorial-title mt-3 text-4xl">{nextAppointment ? formatDate(nextAppointment.appointment_date) : "Nicio programare activă"}</h2>
                  <p className="mt-3 text-sm text-[var(--muted)]">{nextAppointment ? `${nextAppointment.appointment_time || ""} · ${nextAppointment.custom_note || nextAppointment.note || "Programare confirmată"}` : "Când Antonia adaugă o programare, apare aici."}</p>
                  <div className="mt-5 flex flex-wrap gap-2 text-sm text-[var(--muted)]"><span className="status-pill status-available">Creată</span><span className="status-pill status-available">Confirmată</span><span className="status-pill status-limited">Reminder</span><span className="status-pill status-limited">Urmează</span></div>
                </section>
                <section className="lux-panel rounded-[2.3rem] p-6 md:p-8">
                  <p className="lux-label">Rank benefits</p>
                  <div className="flex items-start justify-between gap-4"><div><h2 className="editorial-title mt-3 text-5xl leading-none">{rank.name}</h2><p className="mt-4 text-sm text-[var(--muted)]">{nextRankVizite ? `Mai ai ${visitsToNextRank} vizite până la următorul rank.` : "Ai ajuns la cel mai înalt rank."}</p></div><Sparkles className="h-8 w-8 text-[var(--rose-strong)]" /></div>
                  <div className="mt-6 grid gap-3 md:grid-cols-3">{rank.benefits.map((benefit) => <div key={benefit} className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm text-[var(--muted)]"><ShieldCheck className="mb-3 h-5 w-5 text-[var(--rose-strong)]" />{benefit}</div>)}</div>
                </section>
                <section className="lux-panel rounded-[2.3rem] p-6 md:p-8 xl:col-span-2">
                  <p className="lux-label">Recent updates</p>
                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <button onClick={() => setActiveTab("appointments")} className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 text-left"><CalendarDays className="h-5 w-5 text-[var(--rose-strong)]" /><p className="mt-3 font-serif text-2xl">Programări</p><p className="mt-1 text-sm text-[var(--muted)]">{appointments.length} în cont</p></button>
                    <button onClick={() => setActiveTab("rewards")} className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 text-left"><Gift className="h-5 w-5 text-[var(--rose-strong)]" /><p className="mt-3 font-serif text-2xl">Rewards</p><p className="mt-1 text-sm text-[var(--muted)]">{rewards.length} carduri</p></button>
                    <button onClick={() => setActiveTab("inspirations")} className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 text-left"><ImagePlus className="h-5 w-5 text-[var(--rose-strong)]" /><p className="mt-3 font-serif text-2xl">Inspirații</p><p className="mt-1 text-sm text-[var(--muted)]">{inspirations.length} poze salvate</p></button>
                  </div>
                </section>
                <section className="lux-panel rounded-[2.3rem] p-6 md:p-8 xl:col-span-2">
                  <p className="lux-label">Theme Engine</p>
                  <h2 className="editorial-title mt-3 text-4xl">Tema ta personală</h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">Alege o culoare doar pentru contul tău. Nu schimbă tema pentru alte cliente.</p>
                  <button onClick={() => setActiveTab("appearance")} className="lux-action lux-action-soft mt-5 rounded-full px-5 py-3 text-sm font-semibold">Schimbă tema</button>
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
                <div className="mt-6 space-y-3">{appointments.map((item) => <div key={item.id} className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4"><div className="flex flex-wrap items-center justify-between gap-3"><p className="font-serif text-2xl">{formatDate(item.appointment_date)} {formatTime(item.appointment_time)}</p><span className="status-pill status-limited">{item.status}</span></div>{(item.custom_note || item.note) && <p className="mt-2 text-sm text-[var(--muted)]">{item.custom_note || item.note}</p>}</div>)}{appointments.length === 0 && <p className="text-sm text-[var(--muted)]">Nu ai programări încă.</p>}</div>
              </section>
            )}

            {activeTab === "rewards" && (
              <section className="lux-panel rounded-[2.3rem] p-6 md:p-8">
                <p className="lux-label">Rewards</p><h2 className="editorial-title mt-3 text-5xl">Progres reward</h2><p className="mt-4 text-sm text-[var(--muted)]">Încă {5 - rewardProgress === 5 ? 5 : 5 - rewardProgress} vizite până la următorul voucher.</p>
                <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-center"><div className="relative grid h-32 w-32 place-items-center rounded-full" style={{ background: `conic-gradient(var(--rose-strong) ${rewardPercent}%, rgba(255,255,255,.08) 0)` }}><div className="grid h-[6.6rem] w-[6.6rem] place-items-center rounded-full bg-[var(--bg)] text-3xl font-semibold">{rewardPercent}%</div></div><div className="flex-1"><div className="h-3 overflow-hidden rounded-full bg-[var(--panel)]"><div className="h-full rounded-full bg-[var(--rose)]" style={{ width: `${rewardPercent}%` }} /></div><div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4"><p className="lux-label">5 vizite</p><p className="mt-2 font-serif text-3xl">10% off</p></div><div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4"><p className="lux-label">10 vizite</p><p className="mt-2 font-serif text-3xl">25% off</p></div><div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4"><p className="lux-label">15 vizite</p><p className="mt-2 font-serif text-3xl">50% off</p></div></div></div></div>
                <button onClick={generateReward} disabled={!canGenerateReward} className="lux-action lux-action-soft mt-6 rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-45">Generează voucher</button>
                <div className="mt-5 grid gap-3 md:grid-cols-2">{rewards.map((reward) => <div key={reward.id} className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4"><p className="text-xs uppercase tracking-[.26em] text-[var(--faint)]">Reward #{reward.reward_number}</p><p className="mt-2 font-semibold">{reward.code}</p><p className="mt-1 text-sm text-[var(--muted)]">{reward.status}</p><button onClick={() => downloadVoucher(reward)} className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2 text-sm"><Download className="h-4 w-4" /> Descarcă PNG</button></div>)}</div>
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
                  {myReviews.map((review) => <article key={review.id} className="rounded-[1.7rem] border border-[var(--line)] bg-[var(--panel)] p-5">{review.photo_url && <img src={review.photo_url} alt="Review" className="mb-4 aspect-[4/3] w-full rounded-[1.25rem] object-cover" />}<div className="flex items-center justify-between gap-3"><p className="text-sm text-[var(--rose-strong)]">{"★".repeat(review.rating || 5)}</p><span className={review.is_approved ? "status-pill status-available mt-0" : "status-pill status-limited mt-0"}>{review.is_approved ? "Publicat" : "În așteptare"}</span></div><p className="mt-4 text-sm leading-7 text-[var(--muted)]">“{review.text}”</p><p className="mt-3 text-xs text-[var(--faint)]">{formatDate(review.created_at)}</p></article>)}
                  {myReviews.length === 0 && <div className="rounded-[1.7rem] border border-[var(--line)] bg-[var(--panel)] p-5 text-sm leading-7 text-[var(--muted)]">Nu ai lăsat încă niciun review.</div>}
                </div>
              </section>
            )}

            {activeTab === "notifications" && (
              <section className="lux-panel rounded-[2.3rem] p-6 md:p-8"><p className="lux-label">Notificări</p><h2 className="editorial-title mt-3 text-5xl">Actualizări</h2><div className="mt-4 flex flex-wrap items-center gap-3"><span className={profile?.notification_permission === "granted" ? "status-pill status-available mt-0" : "status-pill status-full mt-0"}>{profile?.notification_permission === "granted" ? "Enabled" : "Disabled"}</span><button type="button" onClick={enableNotificări} disabled={actionLoading === "notifications"} className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold disabled:opacity-50"><Bell className="mr-2 inline h-4 w-4" /> {actionLoading === "notifications" ? "Se verifică..." : "Activează notificări"}</button><button type="button" onClick={testNotification} className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold">Trimite test acum</button><button type="button" onClick={testDelayedNotification} className="rounded-full border border-[var(--line)] bg-[var(--text)] px-4 py-2 text-sm font-semibold text-[var(--bg)]">Test 8 secunde</button><PwaInstallCard /></div><div className="mt-7 space-y-4">{notifications.map((item, index) => <div key={item.id} className="grid gap-4 md:grid-cols-[80px_1fr]"><div className="text-xs uppercase tracking-[.22em] text-[var(--faint)]">{index === 0 ? "Latest" : formatDate(item.created_at)}</div><div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5"><p className="lux-label">{item.status || "in-app"}</p><p className="mt-2 font-serif text-3xl">{item.title}</p><p className="mt-2 text-sm leading-7 text-[var(--muted)]">{item.message}</p></div></div>)}</div></section>
            )}


            {activeTab === "appearance" && (
              <section className="lux-panel rounded-[2.3rem] p-6 md:p-8">
                <p className="lux-label">Theme Engine</p>
                <h2 className="editorial-title mt-3 text-5xl">Tema contului tău</h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">Alege vibe-ul care îți place. Se salvează pe dispozitivul tău și se aplică instant, fără să afecteze alte cliente sau dashboard-ul Antoniei.</p>
                <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  {accentOptions.map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => changeAccent(option.value)}
                      className={`rounded-[1.5rem] border p-5 text-left transition hover:-translate-y-1 ${selectedAccent === option.value ? "border-[var(--rose)] bg-[var(--panel-strong)] text-[var(--text)] shadow-[0_0_34px_color-mix(in_srgb,var(--rose)_18%,transparent)]" : "border-[var(--line)] bg-[var(--panel)] text-[var(--muted)]"}`}
                    >
                      <span className="block font-serif text-3xl text-[var(--text)]">{option.label}</span>
                      <span className="mt-3 block text-xs leading-5 text-[var(--muted)]">{option.description}</span>
                      <span className="mt-5 inline-flex h-8 w-8 rounded-full border border-[var(--line)] bg-[var(--rose)] shadow-[0_0_24px_color-mix(in_srgb,var(--rose)_45%,transparent)]" />
                    </button>
                  ))}
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

      {guideOpen && <div className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-5 backdrop-blur-xl"><div className="lux-panel max-w-xl rounded-[2.4rem] p-7"><p className="lux-label">Ghid rapid</p><h2 className="editorial-title mt-3 text-5xl">Bine ai venit la neilzzbyanto</h2><div className="mt-6 space-y-4 text-sm leading-7 text-[var(--muted)]"><p><b>Inspirațiile mele:</b> salvează modele din galerie sau încarcă pozele tale.</p><p><b>Rewards & Rank:</b> urmărește progresul și descarcă voucher PNG.</p><p><b>Programări:</b> vezi următoarea programare și istoricul tău.</p><p><b>Notificări:</b> activează reminderele pentru programări și updates.</p><p><b>Review-uri:</b> după activare poți lăsa review verificat cu poză opțională.</p></div><button onClick={() => setGuideOpen(false)} className="lux-action lux-action-soft mt-7 rounded-full px-5 py-3 text-sm font-semibold">Am înțeles</button></div></div>}
    </main>
  );
}
