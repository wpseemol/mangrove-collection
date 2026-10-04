"use client";

import { LayoutDashboard, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/shared/container";
import { Logo } from "@/components/shared/logo";
import { useHydrated } from "@/hooks/use-hydrated";
import { DASHBOARD_LOGIN_URL, DASHBOARD_URL } from "@/lib/config";
import { PAYMENT_METHOD_LABEL } from "@/lib/format";
import { usePaymentOptions, useSettings } from "@/lib/queries";
import { isStaff } from "@/lib/types";
import { useAuthStore } from "@/stores/auth";

import { FacebookIcon, InstagramIcon, LinkedInIcon, TwitterIcon, WhatsAppIcon, whatsappHref, YouTubeIcon } from "./social-icons";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All products" },
      { href: "/categories", label: "Categories" },
      { href: "/offers", label: "Offers" },
      { href: "/track-order", label: "Track order" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "Our story" },
      { href: "/blog", label: "Blog" },
      { href: "/contact", label: "Contact us" },
      { href: "/privacy-policy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of service" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/account", label: "My account" },
      { href: "/account/orders", label: "My orders" },
      { href: "/cart", label: "Cart" },
      { href: "/login", label: "Sign in / Register" },
    ],
  },
];

/** Admins and managers have no customer account; the dashboard replaces it. */
const STAFF_ACCOUNT_LINKS = [
  { href: DASHBOARD_URL, label: "Dashboard" },
  { href: "/cart", label: "Cart" },
];

export function SiteFooter() {
  const { data: settings } = useSettings();
  const hydrated = useHydrated();
  const user = useAuthStore((s) => s.user);
  const staff = hydrated && isStaff(user);
  const social = settings?.social_links ?? {};
  const siteName = settings?.site_name ?? "Mangrove Collection";
  const { data: paymentOptions } = usePaymentOptions();
  const payments = paymentOptions?.map((option) => option.method) ?? [];

  const socials = [
    social.facebook && { href: social.facebook, label: "Facebook", icon: FacebookIcon },
    social.instagram && { href: social.instagram, label: "Instagram", icon: InstagramIcon },
    social.twitter && { href: social.twitter, label: "Twitter", icon: TwitterIcon },
    social.youtube && { href: social.youtube, label: "YouTube", icon: YouTubeIcon },
    social.linkedin && { href: social.linkedin, label: "LinkedIn", icon: LinkedInIcon },
    settings?.whatsapp_number && { href: whatsappHref(settings.whatsapp_number, settings.whatsapp_message), label: "WhatsApp", icon: WhatsAppIcon },
  ].filter(Boolean) as { href: string; label: string; icon: typeof FacebookIcon }[];

  const contacts = [
    settings?.contact_phone && { icon: Phone, value: settings.contact_phone, href: `tel:${settings.contact_phone}` },
    settings?.contact_email && { icon: Mail, value: settings.contact_email, href: `mailto:${settings.contact_email}` },
    settings?.contact_address && { icon: MapPin, value: settings.contact_address },
  ].filter(Boolean) as { icon: typeof Phone; value: string; href?: string }[];

  return (
    <footer className="bg-forest text-white">
      <Container className="grid gap-12 py-16 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-sm space-y-5">
          <Logo tone="light" />
          <p className="text-sm leading-relaxed text-white/70">
            {settings?.site_tagline ?? "Fresh fish, crab, prawn and pure honey — collected directly from the heart of the Sundarbans and delivered to your door."}
          </p>
          {contacts.length > 0 && (
            <ul className="space-y-2.5 text-sm text-white/80">
              {contacts.map(({ icon: Icon, value, href }) => (
                <li key={value} className="flex items-start gap-2.5">
                  <Icon className="mt-0.5 size-4 shrink-0 text-brand" />
                  {href ? (
                    <a href={href} className="hover:text-white">
                      {value}
                    </a>
                  ) : (
                    <span>{value}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
          {socials.length > 0 && (
            <div className="flex gap-2">
              {socials.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white/90 transition-colors hover:bg-brand hover:text-white"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h3 className="mb-4 text-sm font-semibold text-white">{column.title}</h3>
            <ul className="space-y-3">
              {(staff && column.title === "Account" ? STAFF_ACCOUNT_LINKS : column.links).map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/65 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-4 py-6 text-xs text-white/55 sm:flex-row">
          <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span>
              © {new Date().getFullYear()} {siteName}. All rights reserved.
            </span>
            <a
              href={staff ? DASHBOARD_URL : DASHBOARD_LOGIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-white/55 transition-colors hover:text-white"
            >
              <LayoutDashboard className="size-3.5" />
              {staff ? "Open dashboard" : "Admin login"}
            </a>
          </p>
          {payments.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="mr-1">We accept</span>
              {payments.map((method) => (
                <span key={method} className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1 font-medium text-white/80">
                  {PAYMENT_METHOD_LABEL[method] ?? method}
                </span>
              ))}
            </div>
          )}
        </Container>
      </div>
    </footer>
  );
}
