"use client";

import Image from "next/image";
import Link from "next/link";

import { useSettings } from "@/lib/queries";
import { cn } from "@/lib/utils";

export function Logo({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  const { data: settings } = useSettings();

  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)} aria-label={`${settings?.site_name ?? "Mangrove Collection"} home`}>
      <Image
        src={settings?.site_logo || "/assets/logo.png"}
        alt=""
        width={44}
        height={44}
        className="size-11 rounded-full bg-white object-contain ring-1 ring-black/5"
        priority
      />
      <span className="flex flex-col leading-none">
        <span className={cn("font-heading text-xl font-semibold tracking-tight", tone === "dark" ? "text-primary" : "text-white")}>Mangrove</span>
        <span className={cn("mt-1 text-[10px] font-medium tracking-[0.32em] uppercase", tone === "dark" ? "text-gold" : "text-white/70")}>
          Collection
        </span>
      </span>
    </Link>
  );
}
