import { AboutStory, StoryBand } from "@/components/home/about-story";
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
      <ProductSection
        eyebrow="Best sellers"
        title="Popular right now"
        subtitle="Our customers' favourites from the Sundarbans."
        filters={{ sort: "popular" }}
        viewAllHref="/shop?sort=popular"
      />
      <ProductSection
        eyebrow="Fresh in"
        title="New arrivals"
        subtitle="The latest catch and harvest, just added to the store."
        filters={{ sort: "latest" }}
        viewAllHref="/shop?sort=latest"
      />
      <StoryBand />
      <AboutStory />
    </>
  );
}
