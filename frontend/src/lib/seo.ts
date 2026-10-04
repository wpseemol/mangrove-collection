import type { Metadata } from "next";

import { SITE_URL } from "@/lib/config";

export const SITE_NAME = "Mangrove Collection";

export const SITE_TITLE = "Mangrove Collection — Fresh Sundarbans Fish, Crab, Prawn & Pure Honey";

export const SITE_DESCRIPTION =
  "Buy fresh Sundarbans fish, mud crab, golda prawn and pure raw mangrove honey online in Bangladesh. Sourced directly from local collectors and delivered to all 64 districts.";

export const SITE_KEYWORDS = [
  "Mangrove Collection",
  "Sundarbans honey",
  "raw mangrove honey",
  "Khalisha honey",
  "Sundarban fish",
  "fresh hilsa",
  "mud crab",
  "golda prawn",
  "online fish shop Bangladesh",
  "buy honey online Bangladesh",
];

export const OG_IMAGE = { url: "/assets/og-image.jpg", width: 800, height: 800, alt: "Mangrove Collection — fresh food from the Sundarbans" };

/** Absolute URL for a site path, e.g. `absoluteUrl("/shop/")`. */
export const absoluteUrl = (path: string) => new URL(path, SITE_URL).toString();

type PageSeo = {
  title: string;
  description: string;
  /** Canonical path with the trailing slash the static export uses, e.g. `/shop/`. Omit for pages whose URL depends on the query string. */
  path?: string;
  /** Private or thin pages (account, cart, checkout...): kept out of search results, links still followed. */
  noindex?: boolean;
  keywords?: string[];
  /** Use the title as is, without the " | Mangrove Collection" suffix. */
  absoluteTitle?: boolean;
};

/**
 * Complete metadata for a page. Next merges `openGraph`, `twitter` and `robots` shallowly, so each page
 * repeats the shared fields instead of relying on the root layout.
 */
export function pageMetadata({ title, description, path, noindex, keywords, absoluteTitle }: PageSeo): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    ...(keywords ? { keywords } : {}),
    ...(path ? { alternates: { canonical: path } } : {}),
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_BD",
      title: fullTitle,
      description,
      images: [OG_IMAGE],
      ...(path ? { url: path } : {}),
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [OG_IMAGE.url] },
    ...(noindex ? { robots: { index: false, follow: true, googleBot: { index: false, follow: true } } } : {}),
  };
}

/** JSON for a `<script type="application/ld+json">`, with `<` escaped so text can't close the tag. */
export const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
