"use client";

import { Star } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

/** Read-only stars; fractional ratings fill the last star partially. */
export function Stars({ value, className, starClassName }: { value: number; className?: string; starClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} role="img" aria-label={`Rated ${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.max(0, Math.min(1, value - star + 1));
        return (
          <span key={star} className={cn("relative inline-block size-4", starClassName)}>
            <Star className="absolute inset-0 size-full text-gold/30" fill="currentColor" strokeWidth={0} />
            {fill > 0 && (
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star className="size-full text-gold" fill="currentColor" strokeWidth={0} style={{ width: "100%", minWidth: "100%" }} />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

const LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

/** Keyboard-accessible 1–5 star picker (radio group semantics). */
export function StarInput({ value, onChange, invalid }: { value: number; onChange: (value: number) => void; invalid?: boolean }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <div className="flex items-center gap-3">
      <div role="radiogroup" aria-label="Your rating" aria-invalid={invalid} className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star > 1 ? "s" : ""} – ${LABELS[star]}`}
            tabIndex={value === star || (!value && star === 1) ? 0 : -1}
            onMouseEnter={() => setHover(star)}
            onClick={() => onChange(star)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowUp") {
                event.preventDefault();
                onChange(Math.min(5, (value || 0) + 1));
              } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
                event.preventDefault();
                onChange(Math.max(1, (value || 2) - 1));
              }
            }}
            className="rounded-md p-0.5 transition-transform outline-none hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Star className={cn("size-8", star <= shown ? "text-gold" : invalid ? "text-destructive/40" : "text-muted-foreground/30")} fill="currentColor" strokeWidth={0} />
          </button>
        ))}
      </div>
      <span className="text-sm font-medium text-foreground/80">{LABELS[shown] || "Tap to rate"}</span>
    </div>
  );
}
