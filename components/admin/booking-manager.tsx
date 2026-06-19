"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type BookingDay = {
  id: string;
  date_label: string;
  day_label: string | null;
  status: string;
  note: string | null;
  position: number | null;
  is_visible: boolean | null;
};

const statusOptions = [
  { value: "available", label: "Disponibil" },
  { value: "limited", label: "Locuri limitate" },
  { value: "full", label: "Full" },
  { value: "vacation", label: "Concediu" },
];

export function BookingManager() {
  const supabase = createClient();

  const [days, setDays] = useState<BookingDay[]>([]);
  const [dateLabel, setDateLabel] = useState("");
  const [dayLabel, setDayLabel] = useState("");
  const [status, setStatus] = useState("available");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  async function loadDays() {
    const { data, error } = await supabase
      .from("booking_days")
      .select("*")
      .order("position", { ascending: true })
      .order("created_at", { ascending: false });

    if (!error && data) setDays(data);
  }

  useEffect(() => {
    loadDays();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!dateLabel.trim()) {
      setMessage("Adaugă data mai întâi.");
      return;
    }

    const nextPosition =
      days.length > 0
        ? Math.max(...days.map((day) => Number(day.position ?? 0))) + 1
        : 1;

    const { error } = await supabase.from("booking_days").insert({
      date_label: dateLabel.trim(),
      day_label: dayLabel.trim() || null,
      status,
      note: note.trim() || null,
      position: nextPosition,
      is_visible: true,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setDateLabel("");
    setDayLabel("");
    setStatus("available");
    setNote("");
    setMessage("Zi de booking adăugată.");
    await loadDays();
  }

  async function handleȘterge(id: string) {
    const confirmed = window.confirm("Ștergi această zi de booking?");
    if (!confirmed) return;

    await supabase.from("booking_days").delete().eq("id", id);
    await loadDays();
  }

  async function toggleVisible(day: BookingDay) {
    await supabase
      .from("booking_days")
      .update({ is_visible: !day.is_visible })
      .eq("id", day.id);

    await loadDays();
  }

  return (
    <div className="space-y-10">
      <form
        onSubmit={handleAdd}
        className="rounded-3xl border border-white/10 bg-white/5 p-6"
      >
        <h2 className="text-2xl font-semibold">Adaugă zi de booking</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55">Exemplu recomandat: data „23 martie”, ziua „Luni”, status „Locuri limitate”, notă „2 locuri libere”. Dacă e concediu, alege status „Concediu” și scrie perioada.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <input
            className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm"
            placeholder="Ex: 23 martie"
            value={dateLabel}
            onChange={(e) => setDateLabel(e.target.value)}
          />

          <input
            className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm"
            placeholder="Ex: Luni"
            value={dayLabel}
            onChange={(e) => setDayLabel(e.target.value)}
          />

          <select
            className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <input
            className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm"
            placeholder="Ex: 2 locuri libere / full / concediu"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {message && <p className="mt-4 text-sm text-white/60">{message}</p>}

        <Button className="mt-6" type="submit">
          Adaugă zi
        </Button>
      </form>

      <div className="grid gap-4 md:grid-cols-3">
        {days.map((day) => (
          <div
            key={day.id}
            className="rounded-3xl border border-white/10 bg-white/5 p-6"
          >
            <p className="text-sm uppercase tracking-[0.25em] text-white/40">
              {day.day_label || "Zi"}
            </p>
            <h3 className="mt-3 text-3xl font-semibold">{day.date_label}</h3>
            <p className="mt-3 text-white/70">{day.note || day.status}</p>
            <p className="mt-2 text-sm text-white/40">
              Status: {day.status}
            </p>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => toggleVisible(day)}
                className="rounded-full border border-white/10 px-4 py-2 text-sm hover:bg-white/10"
              >
                {day.is_visible ? "Ascunde" : "Arată"}
              </button>

              <button
                onClick={() => handleȘterge(day.id)}
                className="rounded-full border border-red-400/20 px-4 py-2 text-sm text-red-300 hover:bg-red-400/10"
              >
                Șterge
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
