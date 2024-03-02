import mangroveFish from '../../assets/image/mangrove Fish.png';
import honeyCollection from '../../assets/image/mangrove honey.jpg';
import SliderHero from '../SliderHero/SliderHero';

export default function HeroSection() {
    return (
        <section className="my-10 container mx-auto">
            <div className="grid md:grid-cols-3 grid-cols-4 gap-4 ">
                <div className="md:col-span-2 col-span-4 md:row-span-2 ">
                    <SliderHero />
                </div>
                <div className="md:col-span-1 col-span-2">
                    {' '}
                    <img
                        src={honeyCollection}
                        alt="Honey Collection"
                        className="w-full h-full object-cover object-center"
                    />
                </div>
                <div className="md:col-span-1 col-span-2">
                    {' '}
                    <img
                        src={mangroveFish}
                        alt="mangrove fish"
                        className="w-full h-full object-cover object-center"
                    />
                </div>
            </div>
        </section>
    );
}
