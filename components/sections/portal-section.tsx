"use client";

import { motion } from "framer-motion";
import {
  Camera,
  Star,
  Check,
  X,
  Mail,
  KeyRound,
  User,
  LockKeyhole,
} from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { instagramUrl } from "@/lib/mock-data";

type Mode = "login" | "register";

function FieldRow({
  icon: Icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon: typeof Mail;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-bg/40 px-4 py-3 transition-colors focus-within:border-rose/40 dark:border-pearl/10">
      <Icon className="h-4 w-4 flex-shrink-0 text-ink/40 dark:text-pearl/40" />
      <input
        {...props}
        className="w-full bg-transparent font-body text-sm text-ink placeholder:text-ink/40 focus:outline-none dark:text-pearl dark:placeholder:text-pearl/40"
      />
    </div>
  );
}

export function PortalSection() {
  const [mode, setMode] = React.useState<Mode>("register");
  const [submitted, setSubmitted] = React.useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="portal" className="px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div>
            <Badge>How Booking Works</Badge>
            <h2 className="mt-4 max-w-sm font-display text-3xl text-ink dark:text-pearl sm:text-4xl">
              Step inside the inner circle.
            </h2>
            <p className="mt-3 max-w-sm font-body text-sm text-ink/60 dark:text-pearl/60 sm:text-base">
              After your appointment, Antonia hands you a one-time code.
              Register with it to unlock early booking windows and
              members-only sets.
            </p>
            <p className="mt-6 max-w-sm font-body text-xs text-ink/45 dark:text-pearl/45">
              Don't have a code yet? It's given out in person — there's no
              way to request one online.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
          >
            <GlassCard className="mx-auto max-w-md">
              {submitted ? (
                <div className="py-4 text-center">
                  <p className="font-display text-xl text-ink dark:text-pearl">
                    Almost there
                  </p>
                  <p className="mt-3 font-body text-sm leading-relaxed text-ink/65 dark:text-pearl/65">
                    Client accounts aren't connected yet — you're looking at
                    a preview of how it'll work. Ask Antonia about the inner
                    circle directly on Instagram in the meantime.
                  </p>
                  <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
                    <Button variant="outline" onClick={() => setSubmitted(false)}>
                      Back to form
                    </Button>
                    <Button asChild>
                      <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="text-sm">↗</span>
                        Open Instagram
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div
                    role="tablist"
                    aria-label="Login or register"
                    className="grid grid-cols-2 gap-1 rounded-full bg-ink/[0.04] p-1 dark:bg-pearl/[0.06]"
                  >
                    {(["register", "login"] as const).map((m) => (
                      <button
                        key={m}
                        role="tab"
                        aria-selected={mode === m}
                        onClick={() => setMode(m)}
                        className={`rounded-full py-2.5 font-body text-sm font-medium transition-colors ${
                          mode === m
                            ? "bg-bg text-ink shadow-soft dark:bg-surface dark:text-pearl"
                            : "text-ink/50 dark:text-pearl/50"
                        }`}
                      >
                        {m === "register" ? "Register with code" : "Log in"}
                      </button>
                    ))}
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    className="mt-6 space-y-3"
                    key={mode}
                  >
                    {mode === "register" && (
                      <FieldRow
                        icon={KeyRound}
                        placeholder="One-time code"
                        required
                        autoComplete="off"
                      />
                    )}
                    {mode === "register" && (
                      <FieldRow
                        icon={User}
                        placeholder="Full name"
                        required
                        autoComplete="name"
                      />
                    )}
                    <FieldRow
                      icon={Mail}
                      type="email"
                      placeholder="Email"
                      required
                      autoComplete="email"
                    />
                    <FieldRow
                      icon={LockKeyhole}
                      type="password"
                      placeholder="Password"
                      required
                      autoComplete={
                        mode === "register" ? "new-password" : "current-password"
                      }
                    />

                    <Button type="submit" className="w-full">
                      {mode === "register" ? "Create account" : "Log in"}
                    </Button>
                  </form>
                </>
              )}
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
