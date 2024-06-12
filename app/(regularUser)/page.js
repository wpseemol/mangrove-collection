import Category from '@/app/Components/_home/Category';
import Contact from '@/app/Components/_home/Contact';
import HeroSection from '@/app/Components/_home/HeroSection';
import NewArrivalProducts from '@/app/Components/_home/NewArrivalProducts';
import PopularProducts from '@/app/Components/_home/PopularProducts';
import SomeDetails from '@/app/Components/_home/SomeDetails';

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
