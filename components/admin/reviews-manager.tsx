"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ExternalLink, Image as ImageIcon, Star, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Review = {
  id: string;
  name: string | null;
  rating: number | null;
  text: string;
  is_approved: boolean | null;
  is_featured?: boolean | null;
  created_at: string | null;
  photo_url?: string | null;
};

function stars(count?: number | null) {
  return "★".repeat(Math.max(1, Number(count || 5)));
}

export function ReviewsManager() {
  const supabase = createClient();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  async function loadReviews() {
    const { data, error } = await supabase
      .from("reviews")
      .select("id,name,rating,text,is_approved,is_featured,created_at,photo_url")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    setReviews((data || []) as Review[]);
  }

  useEffect(() => {
    loadReviews();
  }, []);

  async function approveReview(review: Review) {
    await supabase.from("reviews").update({ is_approved: !review.is_approved }).eq("id", review.id);
    await loadReviews();
  }

  async function toggleFeatured(review: Review) {
    await supabase.from("reviews").update({ is_featured: !review.is_featured }).eq("id", review.id);
    await loadReviews();
  }

  async function deleteReview(id: string) {
    if (!window.confirm("Ștergi acest review?")) return;
    await supabase.from("reviews").delete().eq("id", id);
    await loadReviews();
  }

  const pendingReviews = useMemo(() => reviews.filter((review) => !review.is_approved), [reviews]);
  const approvedReviews = useMemo(() => reviews.filter((review) => review.is_approved), [reviews]);

  function ReviewCard({ review, pending }: { review: Review; pending?: boolean }) {
    return (
      <article className="lux-panel rounded-[2rem] p-5">
        {review.photo_url ? (
          <button type="button" onClick={() => setPreview(review.photo_url || null)} className="group relative mb-4 block w-full overflow-hidden rounded-[1.35rem] border border-[var(--line)]">
            <img src={review.photo_url} alt="Poză review" className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105" />
            <span className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur-xl"><ExternalLink className="h-3 w-3" /> Vezi poza</span>
          </button>
        ) : (
          <div className="mb-4 grid aspect-[4/3] place-items-center rounded-[1.35rem] border border-dashed border-[var(--line)] bg-[var(--panel)] text-[var(--faint)]"><ImageIcon className="h-8 w-8" /></div>
        )}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-serif text-3xl">{review.name || "Clientă"}</p>
            <p className="mt-2 text-sm text-[var(--rose-strong)]">{stars(review.rating)}</p>
          </div>
          <span className={pending ? "status-pill status-limited mt-0" : "status-pill status-available mt-0"}>{pending ? "Pending" : "Aprobat"}</span>
        </div>
        <p className="mt-4 text-sm leading-7 text-[var(--muted)]">“{review.text}”</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button onClick={() => approveReview(review)} className="rounded-full border border-emerald-300/25 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-400/10"><Check className="mr-1 inline h-4 w-4" /> {review.is_approved ? "Dezaprobă" : "Aprobă"}</button>
          {!pending && <button onClick={() => toggleFeatured(review)} className={review.is_featured ? "rounded-full border border-amber-300/30 px-4 py-2 text-sm text-amber-200" : "rounded-full border border-[var(--line)] px-4 py-2 text-sm text-[var(--muted)]"}><Star className="mr-1 inline h-4 w-4" /> {review.is_featured ? "Featured ON" : "Featured"}</button>}
          <button onClick={() => deleteReview(review.id)} className="rounded-full border border-red-300/20 px-4 py-2 text-sm text-red-300 hover:bg-red-400/10"><Trash2 className="mr-1 inline h-4 w-4" /> Șterge</button>
        </div>
      </article>
    );
  }

  return (
    <div className="space-y-8">
      <section className="lux-panel rounded-[2rem] p-6 md:p-7">
        <p className="lux-label">Review-uri</p>
        <h2 className="mt-3 font-serif text-4xl">Doar review-uri verificate</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">Codurile de activare au fost mutate în Setări. Aici rămân doar review-urile: aprobare, featured și pozele clientelor.</p>
        {message && <p className="mt-4 text-sm text-[var(--rose-strong)]">{message}</p>}
      </section>

      <section className="space-y-4">
        <div><p className="lux-label">În așteptare</p><h3 className="mt-2 font-serif text-4xl">Review-uri noi</h3></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pendingReviews.map((review) => <ReviewCard key={review.id} review={review} pending />)}
          {pendingReviews.length === 0 && <p className="text-sm text-[var(--muted)]">Nu există review-uri în așteptare.</p>}
        </div>
      </section>

      <section className="space-y-4">
        <div><p className="lux-label">Publice</p><h3 className="mt-2 font-serif text-4xl">Review-uri aprobate</h3></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {approvedReviews.map((review) => <ReviewCard key={review.id} review={review} />)}
          {approvedReviews.length === 0 && <p className="text-sm text-[var(--muted)]">Încă nu există review-uri aprobate.</p>}
        </div>
      </section>

      {preview && (
        <button type="button" onClick={() => setPreview(null)} className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-5 backdrop-blur-xl">
          <img src={preview} alt="Poză review" className="max-h-[88vh] max-w-[92vw] rounded-[2rem] border border-white/15 object-contain shadow-2xl" />
        </button>
      )}
    </div>
  );
}
