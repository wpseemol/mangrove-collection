"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const hydrated = useHydrated();
  const { resolvedTheme, setTheme } = useTheme();
  const dark = !hydrated || resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary transition-colors hover:bg-primary hover:text-white dark:text-brand dark:hover:text-white",
        className,
      )}
    >
      {dark ? <Sun className="size-5" strokeWidth={1.8} /> : <Moon className="size-5" strokeWidth={1.8} />}
    </button>
  );
}
