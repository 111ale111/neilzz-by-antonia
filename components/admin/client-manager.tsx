"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarPlus, Check, Eye, Minus, Plus, Search, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Profile = { id: string; email: string | null; full_name: string | null; avatar_url: string | null; role: string | null; is_activated: boolean | null; visit_count: number | null; loyalty_goal: number | null; admin_notes?: string | null; notification_permission?: string | null; };
type Appointment = { id: string; client_id: string; appointment_date: string; appointment_time: string | null; status: string; note: string | null; custom_note?: string | null; send_notifications?: boolean | null; };
type Inspiration = { id: string; client_id: string; image_url: string; title: string | null; note: string | null; source_type: string; created_at: string; };
type Reward = { id: string; client_id: string; code: string; reward_number: number; status: string; reward_type?: string | null; };

const months = [
  { value: "01", label: "Ianuarie" }, { value: "02", label: "Februarie" }, { value: "03", label: "Martie" }, { value: "04", label: "Aprilie" }, { value: "05", label: "Mai" }, { value: "06", label: "Iunie" }, { value: "07", label: "Iulie" }, { value: "08", label: "August" }, { value: "09", label: "Septembrie" }, { value: "10", label: "Octombrie" }, { value: "11", label: "Noiembrie" }, { value: "12", label: "Decembrie" },
];
const timeSlots = Array.from({ length: 45 }, (_, index) => { const total = 9 * 60 + index * 15; return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`; });
function rankFor(visits: number) { if (visits >= 15) return { name: "Elite", full: "Clientă elite", mark: "✧◇✧" }; if (visits >= 10) return { name: "VIP", full: "Clientă VIP", mark: "◇" }; if (visits >= 5) return { name: "Regular", full: "Clientă regulară", mark: "✦" }; return { name: "Nouă", full: "Clientă nouă", mark: "○" }; }
function initials(name?: string | null, email?: string | null) { const s = (name || email || "neilzzbyanto").replace(/@.*/, ""); const p = s.split(/\s+/).filter(Boolean); return (p[0]?.[0] || "N").toUpperCase() + (p[1]?.[0] || "Z").toUpperCase(); }
function buildDate(year: string, month: string, day: string) { return year && month && day ? `${year}-${month}-${day.padStart(2, "0")}` : ""; }
function formatDate(v: string) { return new Date(v + "T12:00:00").toLocaleDateString("ro-RO", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }); }
function formatTime(v?: string | null) { return (v || "").slice(0, 5) || "—"; }

export function ClientManager({ mode = "clients" }: { mode?: "clients" | "appointments" }) {
  const supabase = createClient();
  const [clients, setClients] = useState<Profile[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const today = new Date();
  const [day, setDay] = useState("");
  const [month, setMonth] = useState(String(today.getMonth() + 1).padStart(2, "0"));
  const [year, setYear] = useState(String(today.getFullYear()));
  const [time, setTime] = useState("09:00");
  const [note, setNote] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [sendNotifications, setSendNotifications] = useState(true);
  const [message, setMessage] = useState("");
  const [openClient, setOpenClient] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [rankFilter, setRankFilter] = useState("all");

  async function loadAll() {
    const [{ data: profileData }, { data: appointmentData }, { data: inspirationData }, { data: rewardData }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("client_appointments").select("*").order("appointment_date", { ascending: true }),
      supabase.from("client_inspirations").select("*").order("created_at", { ascending: false }),
      supabase.from("client_rewards").select("*").order("issued_at", { ascending: false }),
    ]);
    if (profileData) setClients(profileData as Profile[]);
    if (appointmentData) setAppointments(appointmentData as Appointment[]);
    if (inspirationData) setInspirations(inspirationData as Inspiration[]);
    if (rewardData) setRewards(rewardData as Reward[]);
  }
  useEffect(() => { loadAll(); }, []);

  async function updateClient(client: Profile, payload: Partial<Profile>) { await supabase.from("profiles").update(payload).eq("id", client.id); await loadAll(); }
  async function addVisit(client: Profile, direction: 1 | -1) { const before = Number(client.visit_count || 0); const next = Math.max(0, before + direction); await updateClient(client, { visit_count: next }); if (direction === 1 && next > 0 && next % 5 === 0) await supabase.from("client_notifications").insert({ client_id: client.id, title: "Reward disponibil", message: `Ai ajuns la ${next} vizite. Ai un reward nou disponibil.`, type: "reward" }); }
  async function addAppointment(e: React.FormEvent) {
    e.preventDefault(); setMessage(""); const date = buildDate(year, month, day);
    if (!selectedClient || !date) { setMessage("Alege clienta, data și ora."); return; }
    const { error } = await supabase.from("client_appointments").insert({ client_id: selectedClient, appointment_date: date, appointment_time: time, status: "upcoming", note: note || null, custom_note: customNote || null, send_notifications: sendNotifications });
    if (error) { setMessage(error.message); return; }
    if (sendNotifications) await supabase.from("client_notifications").insert({ client_id: selectedClient, title: "Programare confirmată", message: `Programarea ta este confirmată pentru ${formatDate(date)} la ${time}.${customNote ? ` ${customNote}` : ""}`, type: "appointment", status: "sent" });
    setDay(""); setTime("09:00"); setNote(""); setCustomNote(""); setMessage("Programare adăugată."); await loadAll();
  }
  async function setAppointmentStatus(item: Appointment, status: "completed" | "cancelled") { await supabase.from("client_appointments").update({ status }).eq("id", item.id); if (status === "completed") { const client = clients.find((p) => p.id === item.client_id); if (client) await addVisit(client, 1); } await loadAll(); }

  const profileById = useMemo(() => new Map(clients.map((client) => [client.id, client])), [clients]);
  const clientAppointments = useMemo(() => { const map = new Map<string, Appointment[]>(); appointments.forEach((a) => map.set(a.client_id, [...(map.get(a.client_id) || []), a])); return map; }, [appointments]);
  const clientInspirations = useMemo(() => { const map = new Map<string, Inspiration[]>(); inspirations.forEach((i) => map.set(i.client_id, [...(map.get(i.client_id) || []), i])); return map; }, [inspirations]);
  const clientRewards = useMemo(() => { const map = new Map<string, Reward[]>(); rewards.forEach((r) => map.set(r.client_id, [...(map.get(r.client_id) || []), r])); return map; }, [rewards]);
  const filteredClients = useMemo(() => { const q = search.trim().toLowerCase(); return clients.filter((client) => { const rank = rankFor(Number(client.visit_count || 0)).full; return (!q || `${client.full_name || ""} ${client.email || ""}`.toLowerCase().includes(q)) && (rankFilter === "all" || rank === rankFilter); }); }, [clients, search, rankFilter]);
  const upcoming = appointments.filter((a) => a.status === "upcoming").sort((a, b) => `${a.appointment_date}${a.appointment_time || ""}`.localeCompare(`${b.appointment_date}${b.appointment_time || ""}`));
  const grouped = upcoming.reduce<Record<string, Appointment[]>>((acc, item) => { (acc[item.appointment_date] ||= []).push(item); return acc; }, {});

  const form = (
    <section className="lux-panel rounded-[2rem] p-6 md:p-7">
      <p className="lux-label">Adaugă programare</p>
      <h2 className="mt-3 font-serif text-4xl">Programare nouă</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">Alege clienta, data, ora și un mesaj scurt care apare în contul ei.</p>
      <form onSubmit={addAppointment} className="mt-6 space-y-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.2fr_.5fr_.7fr_.5fr_.65fr]">
          <select className="lux-input" value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}><option value="">Alege clientă</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.full_name || client.email || client.id}</option>)}</select>
          <select className="lux-input" value={day} onChange={(e) => setDay(e.target.value)}><option value="">Zi</option>{Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0")).map((v) => <option key={v} value={v}>{v}</option>)}</select>
          <select className="lux-input" value={month} onChange={(e) => setMonth(e.target.value)}>{months.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}</select>
          <select className="lux-input" value={year} onChange={(e) => setYear(e.target.value)}>{[today.getFullYear(), today.getFullYear() + 1, today.getFullYear() + 2].map((y) => <option key={y} value={String(y)}>{y}</option>)}</select>
          <select className="lux-input" value={time} onChange={(e) => setTime(e.target.value)}>{timeSlots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}</select>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_auto]">
          <input className="lux-input" placeholder="Notiță internă pentru Antonia" value={note} onChange={(e) => setNote(e.target.value)} />
          <input className="lux-input" placeholder="Mesaj pentru clientă, opțional" value={customNote} onChange={(e) => setCustomNote(e.target.value)} />
          <label className="flex min-h-[3.4rem] items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-5 text-sm text-[var(--muted)]"><input type="checkbox" checked={sendNotifications} onChange={(e) => setSendNotifications(e.target.checked)} /> Notificare in-app</label>
        </div>
        <button className="lux-action lux-action-soft inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"><CalendarPlus className="h-4 w-4" /> Adaugă programare</button>
        {message && <p className="text-sm text-[var(--rose-strong)]">{message}</p>}
      </form>
    </section>
  );

  if (mode === "appointments") {
    return <div className="space-y-8">{form}</div>;
  }

  return <div className="space-y-8"><section className="lux-panel rounded-[2rem] p-6 md:p-7"><p className="lux-label">Client manager</p><h2 className="mt-3 font-serif text-4xl">Cliente</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">Caută cliente, activează conturi, modifică vizitele și vezi rapid inspirațiile sau reward-urile.</p><div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]"><div className="relative"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--faint)]" /><input className="lux-input pl-11" placeholder="Caută după nume sau email" value={search} onChange={(e) => setSearch(e.target.value)} /></div><select className="lux-input" value={rankFilter} onChange={(e) => setRankFilter(e.target.value)}><option value="all">Toate rankurile</option><option value="Clientă nouă">Clientă nouă</option><option value="Clientă regulară">Clientă regulară</option><option value="Clientă VIP">Clientă VIP</option><option value="Clientă elite">Clientă elite</option></select></div></section><section className="grid gap-4 md:grid-cols-2">{filteredClients.map((client) => { const visits = Number(client.visit_count || 0); const rank = rankFor(visits); const inspirationList = clientInspirations.get(client.id) || []; const rewardList = clientRewards.get(client.id) || []; return <article key={client.id} className="lux-panel rounded-[2rem] p-6"><div className="flex items-start justify-between gap-4"><div className="flex items-center gap-4"><div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full border border-[var(--line)] bg-[var(--panel-strong)] text-[var(--rose-strong)]">{client.avatar_url ? <img src={client.avatar_url} className="h-full w-full object-cover" alt="Clientă" /> : initials(client.full_name, client.email)}</div><div><h3 className="font-serif text-3xl">{client.full_name || "Clientă"}</h3><p className="text-sm text-[var(--muted)]">{client.email}</p><p className="mt-2 text-xs uppercase tracking-[.24em] text-[var(--rose-strong)]">{rank.mark} {rank.full}</p></div></div><span className={client.is_activated ? "status-pill status-available mt-0" : "status-pill status-limited mt-0"}>{client.is_activated ? "Activată" : "Pending"}</span></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4"><p className="text-xs uppercase tracking-[.24em] text-[var(--faint)]">Vizite</p><div className="mt-2 flex items-center justify-between"><b className="text-2xl">{visits}</b><div className="flex gap-1"><button onClick={() => addVisit(client, -1)} className="rounded-full border border-[var(--line)] p-2"><Minus className="h-3 w-3" /></button><button onClick={() => addVisit(client, 1)} className="rounded-full border border-[var(--line)] p-2"><Plus className="h-3 w-3" /></button></div></div></div><button onClick={() => updateClient(client, { is_activated: !client.is_activated })} className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-left text-sm font-semibold">{client.is_activated ? "Dezactivează" : "Activează"}</button><button onClick={() => setOpenClient(openClient === client.id ? null : client.id)} className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-left text-sm font-semibold"><Eye className="mr-2 inline h-4 w-4" /> Detalii</button></div><textarea className="lux-input mt-4" placeholder="Notițe private despre clientă" value={client.admin_notes || ""} onChange={(e) => updateClient(client, { admin_notes: e.target.value })} />{openClient === client.id && <div className="mt-5 grid gap-5 md:grid-cols-2"><div><p className="lux-label">Programări</p><div className="mt-3 space-y-2">{(clientAppointments.get(client.id) || []).slice(0, 4).map((item) => <div key={item.id} className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-3 text-sm"><p>{formatDate(item.appointment_date)} · {formatTime(item.appointment_time)}</p><p className="text-[var(--faint)]">{item.status}</p></div>)}</div></div><div><p className="lux-label">Inspirații</p><div className="mt-3 grid grid-cols-3 gap-2">{inspirationList.slice(0, 6).map((item) => <img key={item.id} src={item.image_url} alt="Inspiration" className="aspect-square rounded-xl object-cover" />)}</div><p className="mt-4 lux-label">Rewards</p><div className="mt-2 space-y-2">{rewardList.map((reward) => <div key={reward.id} className="rounded-xl border border-[var(--line)] p-3 text-sm"><p>{reward.code}</p><p className="text-[var(--faint)]">{reward.status}</p></div>)}</div></div></div>}</article>; })}</section></div>;
}
