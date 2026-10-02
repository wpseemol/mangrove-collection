"use client";

import { useSettings } from "@/lib/queries";
import { cn } from "@/lib/utils";

import { FacebookIcon, LinkedInIcon, WhatsAppIcon, whatsappHref } from "./social-icons";

export function FloatingSocial() {
  const { data: settings } = useSettings();
  const links = settings?.social_links ?? {};

  const items = [
    links.linkedin && { href: links.linkedin, label: "LinkedIn", icon: LinkedInIcon, className: "bg-[#0a66c2]" },
    links.facebook && { href: links.facebook, label: "Facebook", icon: FacebookIcon, className: "bg-[#1877f2]" },
    links.whatsapp && { href: whatsappHref(links.whatsapp), label: "Chat on WhatsApp", icon: WhatsAppIcon, className: "bg-[#25d366] size-13" },
  ].filter(Boolean) as { href: string; label: string; icon: typeof WhatsAppIcon; className: string }[];

  if (items.length === 0) {
    return null;
  }

  return (
    <aside className="fixed right-4 bottom-4 z-30 flex flex-col items-center gap-2.5 sm:right-6 sm:bottom-6">
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
