import { Camera } from "lucide-react";
import { instagramHandle, instagramUrl } from "@/lib/mock-data";

export function SiteFooter() {
  return (
    <footer className="border-t border-ink/[0.06] dark:border-pearl/[0.08]">
      <div className="mx-auto flex max-w-content flex-col items-center gap-4 px-5 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="font-display text-base text-ink dark:text-pearl">
            Antonia Nail Artist
          </p>
          <p className="mt-1 font-body text-xs text-ink/50 dark:text-pearl/50">
            Hand-finished, one finger at a time.
          </p>
        </div>

        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 font-body text-sm text-ink/70 transition-colors hover:text-rose dark:text-pearl/70"
        >
          <span className="text-sm">📷</span>
          {instagramHandle}
        </a>

        <p className="font-body text-xs text-ink/40 dark:text-pearl/40">
          © {new Date().getFullYear()} Antonia. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
