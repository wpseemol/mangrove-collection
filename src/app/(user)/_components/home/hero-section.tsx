import { Card } from '@/components/ui/card';
import { OuterInfoType } from '@/types/home';
import Image from 'next/image';
import { BsFilterSquare } from 'react-icons/bs';
import { ImWhatsapp } from 'react-icons/im';
import { MdOutlineMessage } from 'react-icons/md';
import HeroSlider from './hero-slider';

export default function HeroSection() {
    return (
        <section className="md:min-h-[calc(100vh-8.5rem)] container mx-auto flex flex-col justify-center md:py-10 py-5 ">
            {/* hero slider section */}
            <div className="grid grid-cols-2 lg:grid-cols-10 gap-3 lg:gap-6">
                <div className="lg:row-span-2 col-span-2 lg:col-span-7">
                    {/* slider section */}
                    <HeroSlider />
                </div>
                <div className="lg:col-span-3 relative flex">
                    <figure className=" overflow-hidden flex justify-center items-center relative">
                        <Image
                            src="/assets/image/mangrove honey.jpg"
                            alt="Honey Collection"
                            className="object-cover object-center w-full h-auto hover:scale-105 duration-200"
                            width={501}
                            height={300}
                        />
                    </figure>
                </div>
                <div className="lg:col-span-3 relative flex">
                    <figure className=" overflow-hidden flex justify-center items-center">
                        <Image
                            src="/assets/image/mangrove Fish.png"
                            alt="Mangrove Fish"
                            className="object-cover object-center w-full h-auto hover:scale-105 duration-200"
                            width={501}
                            height={300}
                        />
                    </figure>
                </div>
            </div>
            {/* hero slider section */}

            <div
                className={`${
                    otherInfo.length > 3
                        ? 'grid md:grid-cols-4 grid-cols-2'
                        : 'flex justify-center flex-wrap'
                }  md:mt-10 mt-5  md:gap-14 gap-5 p-2`}>
                {otherInfo.map((info) => (
                    <Card
                        key={info.id}
                        className="bg-card px-5 py-2 rounded-sm">
                        <div className="flex gap-4 items-center">
                            <div className="w-12 h-12 rounded-full bg-primary text-neutral-200 flex justify-center items-center text-xl">
                                {info.icon}
                            </div>
                            <div>
                                <h2 className="text-secondary-foreground font-medium">
                                    {info.title}
                                </h2>
                                <p className="text-muted-foreground">
                                    {info.description}
                                </p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </section>
    );
}

const otherInfo: OuterInfoType[] = [
    {
        id: '1',
        icon: <BsFilterSquare />,
        title: 'Outfit Finder',
        description: 'Find Outfit for product',
    },
    {
        id: '2',
        icon: <MdOutlineMessage />,
        title: 'Share Experience',
        description: 'We value you feedback',
    },
    {
        id: '3',
        icon: <ImWhatsapp />,
        title: 'Online Support',
        description: 'Get support on WhatsApp',
    },
];
