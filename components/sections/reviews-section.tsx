"use client";

import { motion } from "framer-motion";
import { BadgeCheck, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type PublicReview = {
  id: string;
  name: string | null;
  rating: number | null;
  text: string;
  photo_url?: string | null;
};

function ReviewCard({ review, index }: { review: PublicReview; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
      className="lux-panel snap-center rounded-[2rem] p-5"
    >
      {review.photo_url && <img src={review.photo_url} alt={review.name || "Review"} className="mb-5 aspect-[4/3] w-full rounded-[1.35rem] object-cover" />}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-0.5 text-[var(--rose-strong)]">
          {Array.from({ length: review.rating || 5 }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-current" />
          ))}
        </div>
        <span className="inline-flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.24em] text-[var(--faint)]"><BadgeCheck className="h-4 w-4" /> verificat</span>
      </div>
      <p className="mt-5 text-base leading-8 text-[var(--muted)]">“{review.text}”</p>
      <div className="mt-6 border-t border-[var(--line)] pt-4">
        <p className="font-serif text-2xl text-[var(--text)]">{review.name || "Clientă"}</p>
      </div>
    </motion.article>
  );
}

export function ReviewsSection() {
  const [reviews, setReviews] = useState<PublicReview[]>([]);

  useEffect(() => {
    async function loadReviews() {
      const supabase = createClient();
      const { data } = await supabase
        .from("reviews")
        .select("id,name,rating,text,photo_url")
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(3);
      setReviews((data || []) as PublicReview[]);
    }
    loadReviews();
  }, []);

  return (
    <section id="reviews" className="px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="mx-auto max-w-lg text-center">
          <p className="lux-label">Review-uri verificate</p>
          <h2 className="editorial-title mt-4 text-4xl text-[var(--text)] sm:text-5xl">
            Cliente reale. Rezultate reale.
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)] sm:text-base">
            Pe homepage apar doar review-uri reale aprobate din Supabase.
          </p>
        </div>

        {reviews.length > 0 ? (
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review, i) => (
              <ReviewCard key={review.id} review={review} index={i} />
            ))}
          </div>
        ) : (
          <div className="mx-auto mt-12 max-w-xl rounded-[2rem] border border-[var(--line)] bg-[var(--panel)] p-6 text-center text-sm text-[var(--muted)]">
            Încă nu există review-uri aprobate. Primele review-uri reale vor apărea aici după aprobare.
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/reviews" className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-5 py-3 text-sm font-semibold text-[var(--text)]">Vezi toate review-urile</Link>
        </div>
      </div>
    </section>
  );
}
