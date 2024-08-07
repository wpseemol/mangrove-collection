import Category from '@/components/_home/Category';
import Contact from '@/components/_home/Contact';
import HeroSection from '@/components/_home/HeroSection';
import NewArrivalProducts from '@/components/_home/NewArrivalProducts';
import PopularProducts from '@/components/_home/PopularProducts';
import SomeDetails from '@/components/_home/SomeDetails';

export default function Home() {
    return (
        <main>
            <HeroSection />
            <Category />
            <PopularProducts />
            <NewArrivalProducts />
            <Contact />
            <SomeDetails />
        </main>
    );
}
