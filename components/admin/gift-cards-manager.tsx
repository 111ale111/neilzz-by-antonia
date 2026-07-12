"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Download, RefreshCw, Search, Trash2, Wand2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { downloadDataUrl, renderGiftCardPng } from "@/lib/gift-card-image";

type GiftCard = {
  id: string;
  code: string;
  buyer_name: string | null;
  recipient_name: string | null;
  buyer_email: string | null;
  recipient_email: string | null;
  amount: number | null;
  message: string | null;
  issued_at: string | null;
  expires_at: string | null;
  status: string;
  created_at: string | null;
};

const STATUSES = ["active", "used", "expired", "cancelled"];
const STATUS_LABEL: Record<string, string> = {
  active: "Activ",
  used: "Folosit",
  expired: "Expirat",
  cancelled: "Anulat",
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function plusOneYear() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}
function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 4; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return `NZA-GIFT-${out}`;
}

export function GiftCardsManager() {
  const supabase = createClient();

  const [buyerName, setBuyerName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [issuedAt, setIssuedAt] = useState(todayStr());
  const [expiresAt, setExpiresAt] = useState(plusOneYear());
  const [buyerEmail, setBuyerEmail] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [status, setStatus] = useState("active");
  const [code, setCode] = useState(generateCode());

  const [cards, setCards] = useState<GiftCard[]>([]);
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function loadCards() {
    const { data } = await supabase
      .from("gift_cards")
      .select("id,code,buyer_name,recipient_name,buyer_email,recipient_email,amount,message,issued_at,expires_at,status,created_at")
      .order("created_at", { ascending: false });
    if (data) setCards(data as GiftCard[]);
  }

  useEffect(() => {
    loadCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetForm() {
    setBuyerName("");
    setRecipientName("");
    setAmount("");
    setMessage("");
    setIssuedAt(todayStr());
    setExpiresAt(plusOneYear());
    setBuyerEmail("");
    setRecipientEmail("");
    setStatus("active");
    setCode(generateCode());
  }

  async function downloadCard(card: { recipient_name?: string | null; amount?: number | null; message?: string | null; code: string; expires_at?: string | null }) {
    const dataUrl = await renderGiftCardPng({
      recipient_name: card.recipient_name,
      amount: card.amount,
      message: card.message,
      code: card.code,
      expires_at: card.expires_at,
    });
    if (dataUrl) downloadDataUrl(dataUrl, `gift-card-${card.code}.png`);
  }

  async function generateCard(e: React.FormEvent) {
    e.preventDefault();
    setFeedback("");

    if (!recipientName.trim() || !amount) {
      setFeedback("Completează cel puțin numele destinatarului și suma.");
      return;
    }

    setSaving(true);
    const { data: auth } = await supabase.auth.getUser();

    const payload = {
      code: code.trim().toUpperCase(),
      buyer_name: buyerName.trim() || null,
      recipient_name: recipientName.trim(),
      buyer_email: buyerEmail.trim() || null,
      recipient_email: recipientEmail.trim() || null,
      amount: Number(amount) || 0,
      message: message.trim() || null,
      issued_at: issuedAt || todayStr(),
      expires_at: expiresAt || null,
      status,
      created_by: auth.user?.id || null,
    };

    const { error } = await supabase.from("gift_cards").insert(payload);
    setSaving(false);

    if (error) {
      setFeedback(`Eroare la salvare: ${error.message}`);
      return;
    }

    setFeedback(`Cardul ${payload.code} a fost creat.`);
    await downloadCard(payload);
    await loadCards();
    resetForm();
  }

  async function changeStatus(id: string, nextStatus: string) {
    setBusyId(id);
    await supabase.from("gift_cards").update({ status: nextStatus }).eq("id", id);
    await loadCards();
    setBusyId(null);
  }

  async function deleteCard(id: string) {
    if (!window.confirm("Ștergi acest card cadou definitiv?")) return;
    setBusyId(id);
    await supabase.from("gift_cards").delete().eq("id", id);
    await loadCards();
    setBusyId(null);
  }

  async function copyCode(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setFeedback(`Codul ${value} a fost copiat.`);
    } catch {
      setFeedback("Nu am putut copia codul.");
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        (c.recipient_name || "").toLowerCase().includes(q) ||
        (c.buyer_name || "").toLowerCase().includes(q)
    );
  }, [cards, search]);

  const inputClass = "lux-input";
  const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--faint)]";

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
      {/* Formular */}
      <form onSubmit={generateCard} className="admin-card h-fit rounded-[2rem] p-6 md:p-7">
        <p className="lux-label">Generator</p>
        <h2 className="mt-2 font-serif text-4xl">Card cadou nou</h2>

        <div className="mt-6 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Cumpărător</label>
              <input className={inputClass} value={buyerName} onChange={(e) => setBuyerName(e.target.value)} placeholder="Nume cumpărător" />
            </div>
            <div>
              <label className={labelClass}>Destinatar *</label>
              <input className={inputClass} value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Nume destinatar" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Sumă (lei) *</label>
              <input className={inputClass} type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="200" />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Mesaj personal (opțional)</label>
            <textarea className={`${inputClass} min-h-[84px] resize-none`} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="La mulți ani! Bucură-te de o experiență neilzzbyanto." />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Data emiterii</label>
              <input className={inputClass} type="date" value={issuedAt} onChange={(e) => setIssuedAt(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Data expirării</label>
              <input className={inputClass} type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Email cumpărător (opțional)</label>
              <input className={inputClass} type="email" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} placeholder="email@exemplu.com" />
            </div>
            <div>
              <label className={labelClass}>Email destinatar (opțional)</label>
              <input className={inputClass} type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="email@exemplu.com" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Cod unic</label>
            <div className="flex gap-2">
              <input className={inputClass} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
              <button type="button" onClick={() => setCode(generateCode())} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 text-sm font-semibold text-[var(--text)]">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <button type="submit" disabled={saving} className="lux-action lux-action-solid mt-2 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-extrabold disabled:opacity-50">
            <Wand2 className="h-4 w-4" /> {saving ? "Se generează..." : "Generează cardul"}
          </button>

          {feedback && <p className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-sm text-[var(--rose-strong)]">{feedback}</p>}
        </div>
      </form>

      {/* Listă */}
      <div>
        <div className="relative mb-5">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--faint)]" />
          <input
            className="lux-input pl-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Caută după cod sau nume..."
          />
        </div>

        {filtered.length === 0 ? (
          <div className="admin-card rounded-[2rem] p-10 text-center text-sm text-[var(--muted)]">
            Niciun card cadou {search ? "pentru această căutare" : "creat încă"}.
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((card) => (
              <article key={card.id} className="admin-card rounded-[1.8rem] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-serif text-3xl">{card.recipient_name || "—"}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {card.amount} lei · <span className="font-mono">{card.code}</span>
                    </p>
                    {card.buyer_name && <p className="mt-1 text-xs text-[var(--faint)]">De la: {card.buyer_name}</p>}
                  </div>
                  <span className={`status-pill mt-0 ${card.status === "active" ? "status-available" : card.status === "used" ? "status-completed" : card.status === "expired" ? "status-full" : "status-limited"}`}>
                    {STATUS_LABEL[card.status] || card.status}
                  </span>
                </div>

                {card.message && <p className="mt-3 text-sm italic leading-6 text-[var(--muted)]">“{card.message}”</p>}

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[var(--faint)]">
                  <span>Emis: {card.issued_at || "—"}</span>
                  <span>Expiră: {card.expires_at || "—"}</span>
                  {card.recipient_email && <span>Destinatar: {card.recipient_email}</span>}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => downloadCard(card)} className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel)] px-3.5 py-2 text-xs font-semibold text-[var(--text)]">
                    <Download className="h-3.5 w-3.5" /> Descarcă PNG
                  </button>
                  <button type="button" onClick={() => copyCode(card.code)} className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel)] px-3.5 py-2 text-xs font-semibold text-[var(--text)]">
                    <Copy className="h-3.5 w-3.5" /> Copiază codul
                  </button>
                  {card.status !== "used" && (
                    <button type="button" disabled={busyId === card.id} onClick={() => changeStatus(card.id, "used")} className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel)] px-3.5 py-2 text-xs font-semibold text-[var(--text)] disabled:opacity-50">
                      Marchează folosit
                    </button>
                  )}
                  <select
                    value={card.status}
                    disabled={busyId === card.id}
                    onChange={(e) => changeStatus(card.id, e.target.value)}
                    className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-3.5 py-2 text-xs font-semibold text-[var(--text)]"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                    ))}
                  </select>
                  <button type="button" disabled={busyId === card.id} onClick={() => deleteCard(card.id)} className="ml-auto inline-flex items-center gap-2 rounded-full border border-[#e0808f]/40 bg-[#e0808f]/10 px-3.5 py-2 text-xs font-semibold text-[#f0b7c0] disabled:opacity-50">
                    <Trash2 className="h-3.5 w-3.5" /> Șterge
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
