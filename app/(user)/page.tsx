import CategorySection from './_components/home/category-section';
import HeroSection from './_components/home/hero-section';

export const metadata = {
    title: 'Mangrove Collection | Home',
    description: 'Mangrove Collection home page.',
};

export default function HomePage() {
    return (
        <>
            <main className="">
                <HeroSection />
                <CategorySection />
            </main>
        </>
    );
}
