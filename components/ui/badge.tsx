import * as React from "react";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: string;
  dot?: string;
  children: React.ReactNode;
};

export function Badge({ className = "", children, dot, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-ink/70 dark:text-pearl/70 ${className}`}
      {...props}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-rose-300" /> : null}
      {children}
    </span>
  );
}