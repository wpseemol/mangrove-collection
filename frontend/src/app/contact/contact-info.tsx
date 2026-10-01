"use client";

import { Mail, MapPin, Phone } from "lucide-react";

import { whatsappHref, WhatsAppIcon } from "@/components/layout/social-icons";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettings } from "@/lib/queries";

export function ContactInfo() {
  const { data: settings, isLoading } = useSettings();

  if (isLoading) return <Skeleton className="mt-8 h-32" />;
  if (!settings) return null;

  const items = [
    settings.contact_phone && { icon: Phone, label: "Phone", value: settings.contact_phone, href: `tel:${settings.contact_phone}` },
    settings.contact_email && { icon: Mail, label: "Email", value: settings.contact_email, href: `mailto:${settings.contact_email}` },
    settings.contact_address && { icon: MapPin, label: "Address", value: settings.contact_address },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href?: string }[];

  const whatsapp = settings.social_links?.whatsapp;

  return (
    <div className="mt-10 space-y-6">
      {items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {items.map(({ icon: Icon, label, value, href }) => (
            <div key={label} className="rounded-sm border p-5 text-center">
              <span className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full bg-secondary text-primary">
                <Icon className="size-5" />
              </span>
              <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
              {href ? (
                <a href={href} className="mt-1 block font-medium break-words text-gray-900 hover:text-primary">
                  {value}
                </a>
              ) : (
                <p className="mt-1 font-medium text-gray-900">{value}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {whatsapp && (
        <div className="flex flex-col items-center gap-3 rounded-sm bg-primary p-6 text-center text-white sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-medium">Need help with an order?</p>
            <p className="text-sm text-white/80">Message us on WhatsApp and we&apos;ll reply as soon as possible.</p>
          </div>
          <Button asChild className="bg-brand text-ink hover:bg-brand/90">
            <a href={whatsappHref(whatsapp)} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon className="size-4" /> Chat on WhatsApp
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
