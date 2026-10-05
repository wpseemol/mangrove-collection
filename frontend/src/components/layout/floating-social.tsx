"use client";

import { usePathname } from "next/navigation";

import { useSettings } from "@/lib/queries";
import { cn } from "@/lib/utils";

import { MessengerIcon, messengerHref, WhatsAppIcon, whatsappHref } from "./social-icons";

/** Floating chat buttons (Messenger, WhatsApp) on every page; social page links live in the footer. */
export function FloatingSocial() {
  const { data: settings } = useSettings();
  const pathname = usePathname();

  if (!settings) {
    return null;
  }

  const left = settings.whatsapp_button_position === "left";
  const whatsapp = settings.whatsapp_button_enabled && settings.whatsapp_number ? whatsappHref(settings.whatsapp_number, settings.whatsapp_message) : null;
  const messenger = settings.messenger_button_enabled && settings.messenger_page ? messengerHref(settings.messenger_page) : null;

  if (!whatsapp && !messenger) {
    return null;
  }

  return (
    <aside
      aria-label="Contact us"
      className={cn(
        "fixed z-30 flex flex-col items-center gap-2.5 md:bottom-6",
        left ? "left-4 md:left-6" : "right-4 md:right-6",
        pathname.startsWith("/product") ? "bottom-[calc(9.5rem+env(safe-area-inset-bottom))]" : "bottom-[calc(5rem+env(safe-area-inset-bottom))]",
      )}
    >
      {messenger && (
        <a
          href={messenger}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on Messenger"
          className="group relative flex size-12 items-center justify-center rounded-full bg-linear-to-br from-[#00b2ff] via-[#7a5cff] to-[#ff5c87] text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 focus-visible:ring-4 focus-visible:ring-[#7a5cff]/40 focus-visible:outline-none md:size-13"
        >
          <MessengerIcon className="size-6" />
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute top-1/2 hidden -translate-y-1/2 rounded-full bg-white px-3 py-1.5 text-sm font-medium whitespace-nowrap text-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 md:block dark:bg-card",
              left ? "left-full ml-3" : "right-full mr-3",
            )}
          >
            Message us
          </span>
        </a>
      )}

      {whatsapp && (
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          className="group relative flex size-13 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 focus-visible:ring-4 focus-visible:ring-[#25d366]/40 focus-visible:outline-none md:size-14"
        >
          <span aria-hidden="true" className="absolute inset-0 rounded-full bg-[#25d366] opacity-60 motion-safe:animate-ping [animation-duration:2.5s]" />
          <WhatsAppIcon className="relative size-6 md:size-7" />
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute top-1/2 hidden -translate-y-1/2 rounded-full bg-white px-3 py-1.5 text-sm font-medium whitespace-nowrap text-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 md:block dark:bg-card",
              left ? "left-full ml-3" : "right-full mr-3",
            )}
          >
            Chat with us
          </span>
        </a>
      )}
    </aside>
  );
}
