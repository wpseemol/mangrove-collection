"use client";

import {
     Carousel,
     CarouselContent,
     CarouselItem,
} from "@/components/ui/carousel";

import Image from "next/image";

export default function MobileViewSlider({
     allImage,
     productName,
}: ZoomPreviewImageType) {
     return (
          <>
               <Carousel className=" block md:hidden md:px-0 px-2">
                    <CarouselContent className="">
                         {allImage?.map((img, inx) => (
                              <CarouselItem key={img?.id} className="">
                                   <Image
                                        src={
                                             img?.imgUrl ||
                                             "/assets/logo/no-image.jpg"
                                        }
                                        alt={productName + `-${inx + 1}`}
                                        width={500}
                                        height={500}
                                        className="sm:w-96 w-80 sm:h-96 h-56 object-cover object-center mx-auto rounded"
                                   />
                              </CarouselItem>
                         ))}
                    </CarouselContent>
               </Carousel>
          </>
     );
}

interface ZoomPreviewImageType {
     productName: string;
     allImage: ImageType[];
}

interface ImageType {
     id: string;
     imgUrl: string;
}
