import type { Metadata } from "next";
import { Suspense } from "react";

import { ProductGrid } from "@/components/product/product-grid";
import { Container } from "@/components/shared/container";
import { ShopView } from "@/components/shop/shop-view";

export const metadata: Metadata = {
  title: "Latest Offers",
  description: "Featured products and special offers from Mangrove Collection.",
};

export default function OffersPage() {
  return (
    <Suspense
      fallback={
        <Container className="py-12">
          <ProductGrid loading columns={4} skeletons={8} />
        </Container>
      }
    >
      <ShopView title="Today's offers" description="Featured products and special prices, hand-picked for you." baseFilters={{ featured: true }} />
    </Suspense>
  );
}
