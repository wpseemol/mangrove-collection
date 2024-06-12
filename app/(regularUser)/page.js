import Category from '@/app/Components/_home/Category';
import Contact from '@/app/Components/_home/Contact';
import HeroSection from '@/app/Components/_home/HeroSection';
import SomeDetails from '@/app/Components/_home/SomeDetails';

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
