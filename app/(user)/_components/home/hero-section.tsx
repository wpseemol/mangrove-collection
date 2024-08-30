import { Card } from '@/components/ui/card';
import mangroveFish from '@/public/assets/image/mangrove Fish.png';
import honeyCollection from '@/public/assets/image/mangrove honey.jpg';
import { OuterInfoType } from '@/types/home';
import Image from 'next/image';
import { BsFilterSquare } from 'react-icons/bs';
import { ImWhatsapp } from 'react-icons/im';
import { MdOutlineMessage } from 'react-icons/md';
import HeroSlider from './hero-slider';

export default function HeroSection() {
    return (
        <section className="md:min-h-[calc(100vh-8.5rem)] container mx-auto flex flex-col justify-center py-10">
            {/* hero slider section */}
            <div className="grid md:grid-cols-3 grid-cols-2 gap-4 xl:h-[600px] md:h-[450px]">
                <div
                    className="md:col-span-2 col-span-2 md:row-span-2 border relative overflow-hidden md:h-full
                    sm:h-[300px] h-[200px]">
                    {/* slider section */}
                    <HeroSlider />
                </div>
                <div className="md:col-span-1 col-span-1 overflow-hidden">
                    <Image
                        src={honeyCollection}
                        alt="Honey Collection"
                        className="object-cover object-center w-full h-full hover:scale-105 duration-200"
                        width={501}
                        height={300}
                    />
                </div>

                <div className="md:col-span-1 col-span-1 overflow-hidden ">
                    <Image
                        src={mangroveFish}
                        alt="Mangrove Fish"
                        className="object-cover object-center w-full h-full hover:scale-105 duration-200"
                        width={501}
                        height={300}
                    />
                </div>
            </div>
            {/* hero slider section */}

            <div
                className={`${
                    otherInfo.length > 3
                        ? 'grid md:grid-cols-4 grid-cols-2'
                        : 'flex justify-center flex-wrap'
                }  md:mt-10 mt-8  md:gap-14 gap-5 p-2`}>
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
