"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Send, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  notification_permission?: string | null;
};

type DeliveryMode = "instant" | "scheduled";

export function NotificationComposer({ profiles }: { profiles: Profile[] }) {
  const supabase = createClient();
  const [clientId, setClientId] = useState("all");
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("instant");
  const [scheduledFor, setScheduledFor] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  const sortedProfiles = useMemo(
    () => [...profiles].sort((a, b) => (a.full_name || a.email || "").localeCompare(b.full_name || b.email || "")),
    [profiles],
  );

  async function sendNotification(e: React.FormEvent) {
    e.preventDefault();
    setFeedback("");
    const cleanTitle = title.trim();
    const cleanMessage = message.trim();
    if (!cleanTitle || !cleanMessage) {
      setFeedback("Completează titlul și mesajul.");
      return;
    }
    if (deliveryMode === "scheduled" && !scheduledFor) {
      setFeedback("Alege data și ora pentru notificarea programată.");
      return;
    }

    const targets = clientId === "all" ? sortedProfiles : sortedProfiles.filter((profile) => profile.id === clientId);
    if (targets.length === 0) {
      setFeedback("Nu există clientă selectată.");
      return;
    }

    setLoading(true);
    const now = new Date().toISOString();
    const scheduledIso = deliveryMode === "scheduled" ? new Date(scheduledFor).toISOString() : null;
    const payload = targets.map((profile) => ({
      client_id: profile.id,
      title: cleanTitle,
      message: cleanMessage,
      type: "custom",
      status: deliveryMode === "scheduled" ? "scheduled" : "sent",
      scheduled_for: scheduledIso,
      delivered_at: deliveryMode === "instant" ? now : null,
    }));

    const { error } = await supabase.from("client_notifications").insert(payload);
    if (error) {
      setLoading(false);
      setFeedback(error.message);
      return;
    }

    let pushText = "";
    if (deliveryMode === "instant") {
      try {
        const response = await fetch("/api/push/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientIds: targets.map((profile) => profile.id),
            title: cleanTitle,
            message: cleanMessage,
          }),
        });
        const result = await response.json();
        if (result?.error) {
          pushText = ` Push telefon: ${result.error}`;
        } else {
          pushText = ` Push telefon: ${result.sent || 0}/${result.subscriptionsFound || 0} dispozitive.${result.failed ? ` ${result.failed} eșuate.` : ""}`;
        }
      } catch {
        pushText = " Push telefon nu a putut fi trimis acum.";
      }
    }

    setLoading(false);
    setFeedback(deliveryMode === "scheduled" ? `Notificare programată pentru ${targets.length} cont(uri).` : `Notificare trimisă instant pentru ${targets.length} cont(uri).${pushText}`);
    setTitle("");
    setMessage("");
    setScheduledFor("");
  }

  return (
    <section className="lux-panel rounded-[2.5rem] p-6 md:p-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="lux-label">Custom notification</p>
          <h2 className="editorial-title mt-3 text-5xl">Trimite notificare</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">Alege o clientă sau toate conturile. Instant încearcă să trimită push pe telefon dacă clienta are notificările activate în PWA.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 rounded-full border border-[var(--line)] bg-[var(--panel)] p-1">
          <button type="button" onClick={() => setDeliveryMode("instant")} className={deliveryMode === "instant" ? "rounded-full bg-[var(--panel-strong)] px-4 py-2 text-sm font-semibold text-[var(--text)]" : "rounded-full px-4 py-2 text-sm text-[var(--muted)]"}><Send className="mr-2 inline h-4 w-4" />Instant</button>
          <button type="button" onClick={() => setDeliveryMode("scheduled")} className={deliveryMode === "scheduled" ? "rounded-full bg-[var(--panel-strong)] px-4 py-2 text-sm font-semibold text-[var(--text)]" : "rounded-full px-4 py-2 text-sm text-[var(--muted)]"}><CalendarClock className="mr-2 inline h-4 w-4" />Programată</button>
        </div>
      </div>

      <form onSubmit={sendNotification} className="mt-7 grid gap-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_.75fr]">
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[.24em] text-[var(--faint)]">Destinatar</span>
            <select className="lux-input" value={clientId} onChange={(e) => setClientId(e.target.value)}>
              <option value="all">Toate conturile</option>
              {sortedProfiles.map((profile) => (
                <option key={profile.id} value={profile.id}>{profile.full_name || profile.email || profile.id}</option>
              ))}
            </select>
          </label>
          {deliveryMode === "scheduled" ? (
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[.24em] text-[var(--faint)]">Data și ora</span>
              <input className="lux-input" type="datetime-local" value={scheduledFor} onChange={(e) => setScheduledFor(e.target.value)} />
            </label>
          ) : (
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm text-[var(--muted)]">
              <Users className="mb-2 h-4 w-4 text-[var(--rose-strong)]" />Trimite push pe telefon + salvează și în cont.
            </div>
          )}
        </div>
        <input className="lux-input" placeholder="Titlu notificare" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="lux-input min-h-32 resize-none" placeholder="Mesaj notificare" value={message} onChange={(e) => setMessage(e.target.value)} />
        <button disabled={loading} className="lux-action lux-action-soft inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-50">
          {deliveryMode === "scheduled" ? <CalendarClock className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          {loading ? "Se salvează..." : deliveryMode === "scheduled" ? "Programează notificarea" : "Trimite instant"}
        </button>
        {feedback && <p className="text-sm text-[var(--rose-strong)]">{feedback}</p>}
      </form>
    </section>
  );
}
