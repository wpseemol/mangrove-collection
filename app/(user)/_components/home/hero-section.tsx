import mangroveFish from '@/public/assets/image/mangrove Fish.png';
import honeyCollection from '@/public/assets/image/mangrove honey.jpg';
import Image from 'next/image';
import HeroSlider from './hero-slider';

export default function HeroSection() {
    return (
        <section className="min-h-[calc(100vh-8.5rem)] container mx-auto flex flex-col justify-center">
            <div className="grid md:grid-cols-3 grid-cols-4 gap-4 border">
                <div className="md:col-span-2 col-span-4 md:row-span-2 ">
                    {/* slider section */}
                    <HeroSlider />
                </div>
                <div className="md:col-span-1 col-span-2">
                    {' '}
                    <Image
                        src={honeyCollection}
                        alt="Honey Collection"
                        className="w-full h-full object-cover object-center"
                        width={501}
                        height={346}
                    />
                </div>
                <div className="md:col-span-1 col-span-2">
                    {' '}
                    <Image
                        src={mangroveFish}
                        alt="mangrove fish"
                        className="w-full h-full object-cover object-center"
                        width={501}
                        height={346}
                    />
                </div>
            </div>
        </section>
    );
}
