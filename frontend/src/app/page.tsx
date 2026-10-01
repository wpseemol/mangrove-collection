import { AboutStory } from "@/components/home/about-story";
import { CategorySection } from "@/components/home/category-section";
import { Hero } from "@/components/home/hero";
import { ProductSection } from "@/components/home/product-section";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategorySection />
      <ProductSection title="Popular Products" icon="🔥" filters={{ sort: "popular" }} viewAllHref="/shop?sort=popular" />
      <ProductSection title="Top New Arrival" filters={{ sort: "latest" }} viewAllHref="/shop?sort=latest" />
      <AboutStory />
    </>
  );
}
