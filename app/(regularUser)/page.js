import Category from '../Components/Category/Category';
import Contact from '../Components/Contact/Contact';
import HeroSection from '../Components/HeroSection/HeroSection';
import SomeDetails from '../Components/SomeDetails/SomeDetails';

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
