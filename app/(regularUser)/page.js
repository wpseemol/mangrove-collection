import Category from '@/app/Components/Category/Category';
import Contact from '@/app/Components/Contact/Contact';
import HeroSection from '@/app/Components/HeroSection/HeroSection';
import SomeDetails from '@/app/Components/SomeDetails/SomeDetails';

export default function Home() {
    return (
        <main>
            <HeroSection />
            <Category />
            <Contact />
            <SomeDetails />
        </main>
    );
}
