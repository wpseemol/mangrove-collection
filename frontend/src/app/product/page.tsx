import type { Metadata } from "next";
import { Suspense } from "react";

import { pageMetadata } from "@/lib/seo";

import { ProductDetail } from "./product-detail";

/** The URL depends on `?slug=`, so the canonical link and product details are set in the browser by `ProductSeo`. */
export const metadata: Metadata = pageMetadata({
  title: "Product",
  description: "Fresh, natural produce from the Sundarbans, delivered to your door anywhere in Bangladesh.",
});

/**
 * Product pages are `/product?slug=...` rather than `/product/[slug]`: a static
 * export can only emit dynamic routes known at build time, and products are
 * added from the dashboard after deployment.
 */
export default function ProductPage() {
  return (
    <Suspense>
      <ProductDetail />
    </Suspense>
  );
}
