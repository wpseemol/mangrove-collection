'use client';

import debounce from '@/utils/debounce';
import Image from 'next/image';
import { useState } from 'react';
import ZoomPreviewImage from './zoom-preview-image';

interface ImagePreviewType {
    productName: string;
    allImage: ImageType[];
}

export default function ImagePreview({
    productName,
    allImage,
}: ImagePreviewType) {
    const [previewImage, setPreviewImage] = useState(allImage[0]);

    function handelImagePreviewHover(img: ImageType) {
        setPreviewImage(img);
    }

    const debouncedHandleImageHover = debounce(handelImagePreviewHover, 350);

    return (
        <section className="h-fit">
            {/* preview image */}

            <ZoomPreviewImage
                previewImage={previewImage}
                productName={productName}
                allImage={allImage}
            />
            <div className="md:flex items-center justify-center gap-4 mt-4 hidden">
                {allImage?.map((img, inx) => (
                    <div
                        onMouseOver={() => {
                            debouncedHandleImageHover(img);
                        }}
                        key={img?.id}
                        className={`${
                            previewImage?.id === img?.id
                                ? 'border-primary-foreground'
                                : 'border-neutral-500'
                        } h-14 w-14 overflow-hidden border rounded flex items-center justify-start duration-150`}>
                        <Image
                            src={img?.imgUrl}
                            alt={`${productName} - ${inx + 1}`}
                            width={100}
                            height={100}
                            className="w-full cursor-pointer border object-cover object-center"
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}

interface ImageType {
    id: string;
    imgUrl: string;
}
