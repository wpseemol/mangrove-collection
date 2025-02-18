import CategorySection from './_components/home/category-section';
import FeatureSection from './_components/home/feature-section';
import HeroSection from './_components/home/hero-section';
import PopularProductSection from './_components/home/popular-product-section';

export default function HomePage() {
    return (
        <main>
            <HeroSection />
            <FeatureSection />
            <CategorySection />
            <PopularProductSection />
        </main>
    );
}
