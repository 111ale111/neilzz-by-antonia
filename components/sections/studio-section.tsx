"use client";

import { motion } from "framer-motion";
import { CalendarClock, CheckCircle2, KeyRound, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { studioFeatures } from "@/lib/mock-data";
import type { StudioFeature } from "@/types";

const iconMap: Record<StudioFeature["icon"], typeof Upload> = {
  upload: Upload,
  check: CheckCircle2,
  key: KeyRound,
  calendar: CalendarClock,
};

export function StudioSection() {
  return (
    <section className="px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mx-auto max-w-lg text-center">
          <Badge>How Booking Works</Badge>
          <h2 className="mt-4 font-display text-3xl text-ink dark:text-pearl sm:text-4xl">
            A small dashboard keeps everything tidy.
          </h2>
          <p className="mt-3 font-body text-sm text-ink/60 dark:text-pearl/60 sm:text-base">
            None of this is visible to clients — just a peek at how the
            studio stays organized.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto mt-12 max-w-2xl"
        >
          <GlassCard className="overflow-hidden p-0">
            {/* Mock window chrome — sells "private software," not a real control */}
            <div className="flex items-center gap-2 border-b border-ink/[0.06] px-5 py-3.5 dark:border-pearl/[0.08]">
              <span className="h-2.5 w-2.5 rounded-full bg-rose/40" />
              <span className="h-2.5 w-2.5 rounded-full bg-sand/50" />
              <span className="h-2.5 w-2.5 rounded-full bg-blush/60" />
              <span className="ml-3 font-body text-xs text-ink/40 dark:text-pearl/40">
                studio.antonia — private
              </span>
            </div>

            <div className="grid divide-y divide-ink/[0.06] dark:divide-pearl/[0.08] sm:grid-cols-2 sm:divide-y-0 sm:divide-x">
              {studioFeatures.map((feature) => {
                const Icon = iconMap[feature.icon];
                return (
                  <div key={feature.id} className="flex gap-4 p-6">
                    <span className="glass flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-rose">
                      <Icon className="h-[1.05rem] w-[1.05rem]" />
                    </span>
                    <div>
                      <p className="font-body text-sm font-semibold text-ink dark:text-pearl">
                        {feature.title}
                      </p>
                      <p className="mt-1 font-body text-sm leading-snug text-ink/60 dark:text-pearl/60">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
