import type { Metadata } from "next";
import { Suspense } from "react";

import { ProductGrid } from "@/components/product/product-grid";
import { Container } from "@/components/shared/container";
import { ShopView } from "@/components/shop/shop-view";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Shop Fresh Fish, Crab, Prawn & Honey",
  description:
    "Browse the full Mangrove Collection range: Sundarbans seawater fish, mud crab, golda prawn and raw mangrove honey. Order online with home delivery across Bangladesh.",
  path: "/shop/",
});

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <Container className="py-12">
          <ProductGrid loading columns={4} skeletons={8} />
        </Container>
      }
    >
      <ShopView />
    </Suspense>
  );
}
