import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/config";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";

/** Login, cart and password pages stay crawlable so search engines can see their `noindex` tag. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/account/", "/checkout/", "/order-success/"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
