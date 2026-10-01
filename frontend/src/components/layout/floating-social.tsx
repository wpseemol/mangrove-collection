"use client";

import { useSettings } from "@/lib/queries";

import { FacebookIcon, LinkedInIcon, WhatsAppIcon, whatsappHref } from "./social-icons";

export function FloatingSocial() {
  const { data: settings } = useSettings();
  const links = settings?.social_links ?? {};

  const items = [
    links.whatsapp && { href: whatsappHref(links.whatsapp), label: "WhatsApp", icon: WhatsAppIcon },
    links.facebook && { href: links.facebook, label: "Facebook", icon: FacebookIcon },
    links.linkedin && { href: links.linkedin, label: "LinkedIn", icon: LinkedInIcon },
  ].filter(Boolean) as { href: string; label: string; icon: typeof WhatsAppIcon }[];

  if (items.length === 0) {
    return null;
  }

  return (
    <aside className="fixed top-1/2 right-0 z-30 flex -translate-y-1/2 flex-col overflow-hidden rounded-l-md bg-primary shadow-lg">
      {items.map(({ href, label, icon: Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="flex size-10 items-center justify-center text-white transition-colors hover:bg-white/15"
        >
          <Icon className="size-5" />
        </a>
      ))}
    </aside>
  );
}
