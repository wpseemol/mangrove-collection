import Category from '@/app/Components/_home/Category/Category';
import Contact from '@/app/Components/_home/Contact/Contact';
import HeroSection from '@/app/Components/_home/HeroSection/HeroSection';
import SomeDetails from '@/app/Components/_home/SomeDetails/SomeDetails';

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
