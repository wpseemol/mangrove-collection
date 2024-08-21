'use client';

import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from '@/components/ui/carousel';
import { ImageType } from '@/types/mongoose-models';
import Image from 'next/image';

interface ZoomPreviewImageType {
    productName: string;
    allImage: ImageType[];
}

export default function MobileViewSlider({
    allImage,
    productName,
}: ZoomPreviewImageType) {
    return (
        <>
            <Carousel className=" block md:hidden ">
                <CarouselContent className="ml-0">
                    {allImage?.map((img, inx) => (
                        <CarouselItem key={img?.id} className="">
                            <Image
                                src={img?.imgUrl}
                                alt={productName + `-${inx + 1}`}
                                width={500}
                                height={500}
                                className="sm:w-96 w-80 sm:h-96 h-80 object-cover object-center mx-auto rounded"
                            />
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </>
    );
}
