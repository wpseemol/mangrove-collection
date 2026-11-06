import type { Metadata } from "next";
import { Suspense } from "react";

import { pageMetadata } from "@/lib/seo";

import { ProductBySlug } from "./product-by-slug";

export const metadata: Metadata = pageMetadata({
  title: "Product",
  description: "Fresh, natural produce from the Sundarbans, delivered to your door anywhere in Bangladesh.",
  noindex: true,
});

/**
 * `/product/?slug=…` loads the product from the live API.
 * Prefers this over `/product/[slug]/` when a product was added or renamed
 * after the last static export (those pretty URLs 404 until the next deploy).
 */
export default function ProductBySlugPage() {
  return (
    <Suspense>
      <ProductBySlug />
    </Suspense>
  );
}
