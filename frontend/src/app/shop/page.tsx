import type { Metadata } from "next";
import { Suspense } from "react";

import { ProductGrid } from "@/components/product/product-grid";
import { Container } from "@/components/shared/container";
import { ShopView } from "@/components/shop/shop-view";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse fresh Sundarban fish, crab, prawn and pure honey.",
};

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
