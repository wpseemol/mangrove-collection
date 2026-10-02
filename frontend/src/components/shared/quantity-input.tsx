"use client";

import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

export function QuantityInput({
  value,
  onChange,
  max,
  className,
  size = "default",
}: {
  value: number;
  onChange: (value: number) => void;
  max?: number | null;
  className?: string;
  size?: "default" | "sm";
}) {
  const limit = Math.min(max ?? 100, 100);
  const box = size === "sm" ? "size-8" : "size-12";

  return (
    <div className={cn("inline-flex items-center overflow-hidden rounded-lg border bg-white", className)}>
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
        className={cn(box, "flex items-center justify-center text-gray-700 hover:bg-muted disabled:opacity-40")}
      >
        <Minus className="size-3.5" />
      </button>
      <span className={cn("min-w-8 text-center text-sm font-medium tabular-nums", size === "sm" ? "px-1" : "px-2")} aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={value >= limit}
        onClick={() => onChange(value + 1)}
        className={cn(box, "flex items-center justify-center text-gray-700 hover:bg-muted disabled:opacity-40")}
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
