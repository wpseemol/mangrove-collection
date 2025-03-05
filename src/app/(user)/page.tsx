import CategorySection from './_components/home/category-section';
import Contact from './_components/home/contact';
import FeatureSection from './_components/home/feature-section';
import HeroSection from './_components/home/hero-section';
import NewArrivalProduct from './_components/home/new-arrival-product';
import PopularProductSection from './_components/home/popular-product-section';

export default function HomePage() {
    return (
        <main>
            <HeroSection />
            <FeatureSection />
            <CategorySection />
            <PopularProductSection />
            <NewArrivalProduct />
            <Contact />
        </main>
    );
}
