'use client';

import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from '@/components/ui/carousel';
import Image from 'next/image';

export default function MobileViewSlider({ allImage, productName }) {
    return (
        <>
            <Carousel className=" border block md:hidden">
                <CarouselContent className="">
                    {allImage?.map((img, inx) => (
                        <CarouselItem
                            key={img?.id}
                            className="w-fit mx-auto flex justify-center items-center">
                            <Image
                                src={img?.imgUrl}
                                alt={productName + `-${inx + 1}`}
                                width={500}
                                height={500}
                            />
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </>
    );
}
