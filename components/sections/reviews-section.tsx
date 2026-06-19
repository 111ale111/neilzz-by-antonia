"use client";

import { motion } from "framer-motion";
import { BadgeCheck, Star } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { reviews } from "@/lib/mock-data";
import type { Review } from "@/types";

const swatchClass: Record<Review["swatch"], string> = {
  blush: "bg-blush",
  sand: "bg-sand",
  rose: "bg-rose",
  ink: "bg-ink dark:bg-pearl",
};

function ReviewCard({ review, index }: { review: Review; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
      className="snap-center"
    >
      <GlassCard
        hover
        className="relative w-[19rem] overflow-hidden pl-7 sm:w-auto"
      >
        <span
          aria-hidden="true"
          className={`absolute inset-y-0 left-0 w-2.5 ${swatchClass[review.swatch]}`}
        />

        <div className="flex items-center justify-between">
          <div className="flex gap-0.5 text-sand">
            {Array.from({ length: review.rating }).map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-current" />
            ))}
          </div>
          {review.verified && (
            <Badge>
              <BadgeCheck className="h-3 w-3" />
              Verified
            </Badge>
          )}
        </div>

        <p className="mt-4 font-display text-[1.05rem] leading-snug text-ink dark:text-pearl">
          “{review.quote}”
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-ink/[0.06] pt-4 dark:border-pearl/[0.08]">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blush/50 font-body text-xs font-semibold text-rose dark:bg-blush/15">
              {review.initial}
            </span>
            <div>
              <p className="font-body text-sm font-medium text-ink dark:text-pearl">
                {review.name}
              </p>
              <p className="font-body text-xs text-ink/45 dark:text-pearl/45">
                {review.date}
              </p>
            </div>
          </div>
          <span className="font-body text-xs text-ink/45 dark:text-pearl/45">
            {review.service}
          </span>
        </div>
      </GlassCard>
    </motion.div>
  );
}

export function ReviewsSection() {
  return (
    <section id="reviews" className="px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mx-auto max-w-lg text-center">
          <Badge>How Booking Works</Badge>
          <h2 className="mt-4 font-display text-3xl text-ink dark:text-pearl sm:text-4xl">
            Every review came from a real appointment.
          </h2>
          <p className="mt-3 font-body text-sm text-ink/60 dark:text-pearl/60 sm:text-base">
            No incentives, no fine print — just the people who sat in the
            chair.
          </p>
        </div>

        <div className="mt-12 -mx-5 flex gap-5 overflow-x-auto px-5 pb-4 [scrollbar-width:none] snap-x snap-mandatory sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
          {reviews.map((review, i) => (
            <ReviewCard key={review.id} review={review} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
