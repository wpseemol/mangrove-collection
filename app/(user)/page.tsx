import CategorySection from './_components/home/category-section';
import HeroSection from './_components/home/hero-section';
import NewArrivalProduct from './_components/home/new-arrival-product';
import PopularProduct from './_components/home/popular-product';

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
                <PopularProduct />
                <NewArrivalProduct />
            </main>
        </>
    );
}
