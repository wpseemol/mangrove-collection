import type { Metadata } from "next";

import { InfoCards, OurStory, PromiseBand } from "@/components/home/about-story";
import { CategorySection } from "@/components/home/category-section";
import { Hero } from "@/components/home/hero";
import { ProductSection } from "@/components/home/product-section";
import { TrustStrip } from "@/components/home/trust-strip";
import { pageMetadata, SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  path: "/",
  absoluteTitle: true,
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <CategorySection />
      <ProductSection block="popular" filters={{ sort: "popular" }} viewAllHref="/shop?sort=popular" />
      <ProductSection block="latest" filters={{ sort: "latest" }} viewAllHref="/shop?sort=latest" />
      <PromiseBand />
      <OurStory />
      <InfoCards />
    </>
  );
}
