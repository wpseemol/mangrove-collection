import type { Metadata } from "next";
import { Suspense } from "react";

import { pageMetadata } from "@/lib/seo";

import { LegacyProductRedirect } from "./legacy-redirect";

export const metadata: Metadata = pageMetadata({
  title: "Product",
  description: "Fresh, natural produce from the Sundarbans, delivered to your door anywhere in Bangladesh.",
  noindex: true,
});

/**
 * Legacy `/product/?slug=…` entry. Real product pages live at `/product/[slug]/`
 * with build-time metadata and JSON-LD. Apache 301s production traffic in `.htaccess`.
 */
export default function ProductRedirectPage() {
  return (
    <Suspense>
      <LegacyProductRedirect />
    </Suspense>
  );
}
