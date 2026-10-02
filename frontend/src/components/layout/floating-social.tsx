"use client";

import { usePathname } from "next/navigation";

import { useSettings } from "@/lib/queries";
import { cn } from "@/lib/utils";

import { FacebookIcon, LinkedInIcon, WhatsAppIcon, whatsappHref } from "./social-icons";

export function FloatingSocial() {
  const { data: settings } = useSettings();
  const pathname = usePathname();
  const links = settings?.social_links ?? {};

  const items = [
    links.linkedin && { href: links.linkedin, label: "LinkedIn", icon: LinkedInIcon, className: "hidden md:flex bg-[#0a66c2]" },
    links.facebook && { href: links.facebook, label: "Facebook", icon: FacebookIcon, className: "hidden md:flex bg-[#1877f2]" },
    links.whatsapp && { href: whatsappHref(links.whatsapp), label: "Chat on WhatsApp", icon: WhatsAppIcon, className: "bg-[#25d366] size-12 md:size-13" },
  ].filter(Boolean) as { href: string; label: string; icon: typeof WhatsAppIcon; className: string }[];

  if (items.length === 0) {
    return null;
  }

  return (
    <aside
      className={cn(
        "fixed right-4 z-30 flex flex-col items-center gap-2.5 md:right-6 md:bottom-6",
        pathname.startsWith("/product") ? "bottom-[calc(9.5rem+env(safe-area-inset-bottom))]" : "bottom-[calc(5rem+env(safe-area-inset-bottom))]",
      )}
    >
      {items.map(({ href, label, icon: Icon, className }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className={cn(
            "flex size-11 items-center justify-center rounded-full text-white shadow-lg shadow-black/15 transition-transform hover:scale-105",
            className,
          )}
        >
          <Icon className="size-5" />
        </a>
      ))}
    </aside>
  );
}
