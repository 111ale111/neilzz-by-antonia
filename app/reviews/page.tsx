"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, MessageSquarePlus, Star, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SiteHeader } from "@/components/site-header";

type Review = {
  id: string;
  name: string | null;
  rating: number | null;
  text: string;
  is_approved: boolean | null;
  created_at?: string | null;
  photo_url?: string | null;
};

function Stars({ rating }: { rating?: number | null }) {
  return (
    <div className="flex gap-1 text-[var(--rose-strong)]">
      {Array.from({ length: rating || 5 }).map((_, index) => (
        <Star key={index} className="h-4 w-4 fill-current" />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const supabase = createClient();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      const { data } = await supabase
        .from("reviews")
        .select("id,name,rating,text,is_approved,created_at,photo_url")
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      setReviews((data || []) as Review[]);
      setLoading(false);
    }

    loadReviews();
  }, [supabase]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--bg)] px-5 pb-24 pt-28 text-[var(--text)] md:px-8 md:pt-32">
      <SiteHeader />
      <div className="lux-noise" />
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="soft-pulse absolute left-[8%] top-[4%] h-72 w-72 rounded-full bg-[var(--wine)]/42 blur-[130px]" />
        <div className="soft-pulse absolute right-[8%] top-[18%] h-80 w-80 rounded-full bg-[var(--rose)]/12 blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1320px]">
        <section className="pb-8 pt-8 text-center md:pb-10 md:pt-12">
          <p className="lux-label">Review-uri verificate</p>
          <h1 className="editorial-title mx-auto mt-5 max-w-4xl text-6xl leading-[0.9] md:text-8xl">
            Cliente reale.
            <br /> Rezultate reale.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-[var(--muted)]">
            Aici apar doar review-urile reale aprobate din conturi verificate. Nu mai sunt afișate review-uri generate ca fallback.
          </p>
        </section>

        <section className="mx-auto mb-10 max-w-3xl rounded-[2.2rem] border border-[var(--line)] bg-[var(--panel)] p-5 text-center backdrop-blur-xl md:p-7">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-[var(--line)] bg-[var(--panel-strong)] text-[var(--rose-strong)]">
            <MessageSquarePlus className="h-5 w-5" />
          </div>
          <h2 className="mt-4 font-serif text-4xl">Vrei să lași review?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--muted)]">Review-ul se trimite din contul tău, ca să apară verificat și premium după aprobare.</p>
          <Link href="/account?tab=reviews" className="lux-action lux-action-soft mt-5 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold">
            Lasă review verificat
          </Link>
        </section>

        {loading ? (
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--panel)] p-7 text-center text-sm text-[var(--muted)]">Se încarcă review-urile...</div>
        ) : reviews.length === 0 ? (
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--panel)] p-7 text-center text-sm text-[var(--muted)]">Încă nu există review-uri aprobate.</div>
        ) : (
          <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review, index) => (
              <motion.article
                key={review.id}
                initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-70px" }}
                transition={{ duration: 0.72, delay: (index % 3) * 0.08 }}
                className="lux-panel overflow-hidden rounded-[2.2rem] p-5"
              >
                {review.photo_url && (
                  <button type="button" onClick={() => setPreviewPhoto(review.photo_url || null)} className="mb-5 block w-full overflow-hidden rounded-[1.45rem] border border-[var(--line)] bg-[var(--panel-strong)]">
                    <img src={review.photo_url} alt={review.name || "Review"} className="aspect-[4/3] w-full object-cover transition duration-500 hover:scale-105" />
                  </button>
                )}

                <Stars rating={review.rating} />
                <p className="mt-7 text-xl leading-9 text-[var(--muted)]">“{review.text}”</p>

                <div className="mt-9 flex items-center justify-between gap-4 border-t border-[var(--line)] pt-5">
                  <p className="font-serif text-2xl">{review.name || "Clientă"}</p>
                  <span className="inline-flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.24em] text-[var(--faint)]">
                    <CheckCircle2 className="h-4 w-4" /> verificat
                  </span>
                </div>
              </motion.article>
            ))}
          </section>
        )}
      </div>

      <AnimatePresence>
        {previewPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] grid place-items-center bg-black/88 p-5 backdrop-blur-xl"
            onClick={() => setPreviewPhoto(null)}
          >
            <button type="button" className="absolute right-5 top-5 rounded-full border border-white/15 bg-white/10 p-3 text-white" aria-label="Închide poza">
              <X className="h-5 w-5" />
            </button>
            <img src={previewPhoto} alt="Poză review" className="max-h-[88vh] max-w-[92vw] rounded-[2rem] border border-white/15 object-contain shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
