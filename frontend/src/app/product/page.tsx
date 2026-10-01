import type { Metadata } from "next";
import { Suspense } from "react";

import { ProductDetail } from "./product-detail";

export const metadata: Metadata = { title: "Product" };

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
