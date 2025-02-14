import { Card } from '@/components/ui/card';
import { Feature } from '@/types/home';
import Image from 'next/image';
import { BsFilterSquare } from 'react-icons/bs';
import { ImWhatsapp } from 'react-icons/im';
import { MdOutlineMessage } from 'react-icons/md';
import HeroSlickSlider from './hero-slick-slider';

export default function HeroSection() {
    return (
        <section className=" container mx-auto flex flex-col justify-center md:py-10 pb-5 ">
            {/* hero slider section */}
            <div className="grid grid-cols-2 lg:grid-cols-10 gap-3 lg:gap-6 p-3 md:p-0 2xl:h-[515px] lg:h-[450px] ">
                {/* 2xl:h-[515px] lg:h-[450px] */}
                {/* slider section */}
                <div className="lg:row-span-2 col-span-2 lg:col-span-7 border border-black/10 dark:border-white/80 shadow-sm lg:rounded-l-sm overflow-hidden ">
                    <HeroSlickSlider />
                </div>
                {/* right top section */}
                <div className="lg:col-span-3 relative flex overflow-hidden justify-center items-center border border-black/10 dark:border-white/10 shadow-sm lg:rounded-tr-sm">
                    <figure className="">
                        <Image
                            src="/assets/image/mangrove honey.jpg"
                            alt="Honey Collection"
                            className="object-cover object-center w-full h-auto hover:scale-105 duration-200 lg:w-min-[345px] lg:h-min-[215px] 2xl:w-min-[410px] 2xl:h-min-[245px]"
                            width={501}
                            height={300}
                        />
                    </figure>
                </div>
                {/*right button section */}
                <div className="lg:col-span-3 relative  border border-black/10 dark:border-white/10 shadow-sm lg:rounded-br-sm overflow-hidden flex justify-center items-center">
                    <figure className="">
                        <Image
                            src="/assets/image/mangrove Fish.png"
                            alt="Mangrove Fish"
                            className="object-cover object-center hover:scale-105 duration-200 lg:w-min-[345px] lg:h-min-[215px] 2xl:w-min-[410px] 2xl:h-min-[245px]"
                            width={400}
                            height={245}
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

const otherInfo: Feature[] = [
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
