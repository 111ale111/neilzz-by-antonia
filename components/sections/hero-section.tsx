"use client";

import { motion } from "framer-motion";
import { Camera, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { bookingInfo, instagramUrl } from "@/lib/mock-data";

function SwipeLine({
  text,
  delay,
  className,
}: {
  text: string;
  delay: number;
  className?: string;
}) {
  return (
    <span className="relative inline-block overflow-hidden">
      <span className={className}>{text}</span>
      <motion.span
        aria-hidden="true"
        initial={{ scaleX: 1 }}
        whileInView={{ scaleX: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay, ease: [0.76, 0, 0.24, 1] }}
        style={{ originX: 1 }}
        className="absolute inset-y-0 left-0 right-0 -skew-x-6 bg-gradient-to-r from-blush via-sand to-rose"
      />
    </span>
  );
}

export function HeroSection() {
  return (
    <section className="relative flex min-h-[92vh] flex-col items-center justify-center px-5 pt-28 text-center sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Badge>
          Handcrafted Nail Artistry
        </Badge>
      </motion.div>

      <h1 className="font-display text-balance text-[3.4rem] leading-[0.95] text-ink dark:text-pearl sm:text-7xl md:text-8xl">
        <SwipeLine text="Antonia" delay={0.15} />
        <br />
        <SwipeLine
          text="Nail Artist"
          delay={0.4}
          className="text-[2rem] text-rose sm:text-5xl md:text-6xl"
        />
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="mt-7 max-w-md font-body text-base text-ink/70 dark:text-pearl/70 sm:text-lg"
      >
        Custom sets, painted by hand, one finger at a time — booked privately
        through Instagram, no two appointments quite the same.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.85 }}
        className="mt-9 flex flex-col gap-3 sm:flex-row"
      >
        <Button asChild>
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
            <Camera className="h-4 w-4" />
            Book on Instagram
          </a>
        </Button>
        <Button asChild>
          <a href="#reviews">
            <Star className="h-4 w-4" />
            View Reviews
          </a>
        </Button>
      </motion.div>

      <motion.a
        href="#booking"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.05 }}
        className="glass mt-12 inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-xs font-body text-ink/70 transition-colors hover:text-rose dark:text-pearl/70"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sand opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-sand" />
        </span>
        {bookingInfo.label}
      </motion.a>
    </section>
  );
}
