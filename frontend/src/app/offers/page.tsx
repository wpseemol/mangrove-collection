import type { Metadata } from "next";
import { Suspense } from "react";

import { ProductGrid } from "@/components/product/product-grid";
import { Container } from "@/components/shared/container";
import { ShopView } from "@/components/shop/shop-view";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Latest Offers & Deals",
  description:
    "Today's offers on fresh Sundarbans fish, crab, prawn and pure honey. Save on featured products with home delivery all over Bangladesh.",
  path: "/offers/",
});

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
