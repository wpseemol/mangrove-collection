import CategorySection from './_components/home/category-section';
import FeatureSection from './_components/home/feature-section';
import HeroSection from './_components/home/hero-section';

export default function HomePage() {
    return (
        <main>
            <HeroSection />
            <FeatureSection />
            <CategorySection />
        </main>
    );
}
