import { OurStory, PromiseBand } from "@/components/home/about-story";
import { CategorySection } from "@/components/home/category-section";
import { Hero } from "@/components/home/hero";
import { ProductSection } from "@/components/home/product-section";
import { TrustStrip } from "@/components/home/trust-strip";

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
    </>
  );
}
