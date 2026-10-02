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

  const whatsapp = settings.whatsapp_number ? whatsappHref(settings.whatsapp_number, settings.whatsapp_message) : null;

  return (
    <div className="mt-10 space-y-6">
      {items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {items.map(({ icon: Icon, label, value, href }) => (
            <div key={label} className="rounded-2xl border bg-card p-6 text-center transition-shadow hover:shadow-lg hover:shadow-black/5">
              <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
                <Icon className="size-5" />
              </span>
              <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
              {href ? (
                <a href={href} className="mt-1 block font-medium break-words text-foreground hover:text-primary">
                  {value}
                </a>
              ) : (
                <p className="mt-1 font-medium text-foreground">{value}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {whatsapp && (
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-gradient-to-br from-[#0d4a36] to-forest p-8 text-center text-white sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-heading text-xl font-semibold">Need help with an order?</p>
            <p className="mt-1 text-sm text-white/80">Message us on WhatsApp and we&apos;ll reply as soon as possible.</p>
          </div>
          <Button asChild size="lg" className="bg-[#25d366] text-white hover:bg-[#25d366]/90">
            <a href={whatsapp} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon className="size-4" /> Chat on WhatsApp
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
