"use client";

import { motion } from "framer-motion";
import { CalendarDays, Camera, MessageCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { bookingInfo, instagramUrl } from "@/lib/mock-data";

const steps = [
  {
    icon: MessageCircle,
    title: "Send a DM",
    detail:
      "Message @neilzz_by.anto with your idea, an inspo photo, or simply ask what's available.",
  },
  {
    icon: Sparkles,
    title: "Share the details",
    detail:
      "Preferred date, nail shape, and any reference images help Antonia prep your set in advance.",
  },
  {
    icon: CalendarDays,
    title: "Get confirmed",
    detail:
      "You'll receive a confirmed time and the studio address privately — appointments aren't listed publicly.",
  },
];

export function BookingSection() {
  return (
    <section id="booking" className="px-5 py-24 sm:px-8">
      <div className="mx-auto grid max-w-content gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
        <div>
          <Badge>How Booking Works</Badge>
          <h2 className="mt-4 max-w-md font-display text-3xl text-ink dark:text-pearl sm:text-4xl">
            Appointments are arranged by DM, not by form.
          </h2>
          <p className="mt-3 max-w-md font-body text-sm text-ink/60 dark:text-pearl/60 sm:text-base">
            It keeps things personal — Antonia reads every message herself.
          </p>

          <ol className="mt-10 space-y-7">
            {steps.map((step, i) => (
              <motion.li
                key={step.title}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex gap-4"
              >
                <span className="glass flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-rose">
                  <step.icon className="h-[1.1rem] w-[1.1rem]" />
                </span>
                <div>
                  <p className="font-body text-sm font-semibold text-ink dark:text-pearl">
                    {String(i + 1).padStart(2, "0")} — {step.title}
                  </p>
                  <p className="mt-1 max-w-sm font-body text-sm text-ink/60 dark:text-pearl/60">
                    {step.detail}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
        >
          <GlassCard className="lg:sticky lg:top-28">
            <p className="font-body text-xs uppercase tracking-[0.2em] text-ink/45 dark:text-pearl/45">
              Current status
            </p>
            <div className="mt-3">
              <Badge>
                {bookingInfo.label}
              </Badge>
            </div>
            <p className="mt-4 font-body text-sm leading-relaxed text-ink/70 dark:text-pearl/70">
              {bookingInfo.detail}
            </p>

            <div className="mt-6 flex items-center justify-between rounded-2xl bg-ink/[0.03] px-4 py-3 dark:bg-pearl/[0.05]">
              <span className="font-body text-xs text-ink/50 dark:text-pearl/50">
                Next likely opening
              </span>
              <span className="font-body text-sm font-medium text-ink dark:text-pearl">
                {bookingInfo.nextOpening}
              </span>
            </div>

            <Button className="mt-6 w-full" asChild>
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
                <Camera className="h-4 w-4" />
                Message on Instagram
              </a>
            </Button>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
