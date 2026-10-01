"use client";

import Link from "next/link";

import { Container } from "@/components/shared/container";
import { Logo } from "@/components/shared/logo";
import { useSettings } from "@/lib/queries";

import { FacebookIcon, InstagramIcon, TwitterIcon, WhatsAppIcon, whatsappHref } from "./social-icons";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All Products" },
      { href: "/categories", label: "Categories" },
      { href: "/offers", label: "Offers" },
      { href: "/track-order", label: "Track Order" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy-policy", label: "Privacy" },
      { href: "/terms", label: "Terms of Service" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/account", label: "My Account" },
      { href: "/account/orders", label: "My Orders" },
      { href: "/cart", label: "Cart" },
      { href: "/login", label: "Login / Register" },
    ],
  },
];

export function SiteFooter() {
  const { data: settings } = useSettings();
  const social = settings?.social_links ?? {};
  const siteName = settings?.site_name ?? "Mangrove Collection";

  return (
    <footer className="mt-16 bg-ink text-white">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col items-start gap-4 sm:items-center sm:text-center">
          <Logo />
          <p className="text-sm font-medium tracking-wide text-brand uppercase">Social Media</p>
          <div className="flex items-center gap-4">
            {social.whatsapp && (
              <a
                href={whatsappHref(social.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand/90"
              >
                <WhatsAppIcon className="size-4" /> WhatsApp
              </a>
            )}
            {social.facebook && (
              <a href={social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-brand">
                <FacebookIcon className="size-5" />
              </a>
            )}
            {social.twitter && (
              <a href={social.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-brand">
                <TwitterIcon className="size-5" />
              </a>
            )}
            {social.instagram && (
              <a href={social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-brand">
                <InstagramIcon className="size-5" />
              </a>
            )}
          </div>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h3 className="mb-3 text-sm font-medium tracking-wide text-brand uppercase">{column.title}</h3>
            <ul className="space-y-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/90 hover:text-brand">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <Container>
        <div className="border-t border-white/25 py-5 text-center text-xs text-white/70">
          © {new Date().getFullYear()} Thanks From {siteName}™ Ltd. | All rights reserved.
        </div>
      </Container>
    </footer>
  );
}
