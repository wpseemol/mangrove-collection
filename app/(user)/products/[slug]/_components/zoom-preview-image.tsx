'use client';
import { ImageType } from '@/types/mongoose-models';
import { useZoomImageHover } from '@zoom-image/react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import MobileViewSlider from './mobile-view-slider';

interface ZoomPreviewImageType {
    previewImage: ImageType;
    productName: string;
    allImage: ImageType[];
}

export default function ZoomPreviewImage({
    previewImage,
    productName,
    allImage,
}: ZoomPreviewImageType) {
    const zoomTargetRef = useRef<HTMLDivElement | null>(null);
    const imageHoverContainerRef = useRef<HTMLDivElement | null>(null);

    const [zoomImageTarget, setZoomImageTarget] = useState(false);

    const { createZoomImage: createZoomImageHover } = useZoomImageHover();

    useEffect(() => {
        const imageContainer = imageHoverContainerRef.current;
        const zoomTarget = zoomTargetRef.current;

        if (imageContainer && zoomTarget) {
            createZoomImageHover(imageContainer, {
                zoomImageSource: previewImage.imgUrl,
                customZoom: { width: 720, height: 500 },
                zoomTarget,
                scale: 3.3,
                zoomTargetClass: 'shadow-md bg-slate-200/80',
                zoomLensClass: 'bg-green-700/40 cursor-zoom-in',
            });
        }

        const handleMouseEnter = () => {
            if (zoomTarget) {
                zoomTarget.classList.remove('hidden');
                zoomTarget.classList.add('md:block');
            }
        };

        const handleMouseLeave = () => {
            if (zoomTarget) {
                zoomTarget.classList.remove('md:block');
                zoomTarget.classList.add('hidden');
            }
        };

        if (imageContainer) {
            imageContainer.addEventListener('mouseenter', handleMouseEnter);
            imageContainer.addEventListener('mouseleave', handleMouseLeave);
        }

        // Cleanup event listeners on unmount
        return () => {
            if (imageContainer) {
                imageContainer.removeEventListener(
                    'mouseenter',
                    handleMouseEnter
                );
                imageContainer.removeEventListener(
                    'mouseleave',
                    handleMouseLeave
                );
            }
        };
    }, [createZoomImageHover, previewImage.imgUrl]);

    return (
        <>
            <motion.figure
                key={previewImage.id}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -30, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="lg:w-[500px] lg:h-[500px] md:h-[350px] h-[300px] md:w-[350px] w-[300px] border border-neutral-500/10 bg-slate-200/10 rounded overflow-hidden hidden md:block"
                ref={imageHoverContainerRef}>
                <Image
                    src={previewImage.imgUrl}
                    alt={productName}
                    width={500}
                    height={500}
                    className="object-cover object-center lg:w-[500px] lg:h-[500px] md:h-[350px] h-[300px] md:w-[350px] w-[300px]"
                />
            </motion.figure>

            {/* mobile view */}
            <MobileViewSlider allImage={allImage} productName={productName} />

            <figure
                className="absolute top-0 lg:left-[33rem] md:left-[22rem] hidden"
                ref={zoomTargetRef}></figure>
        </>
    );
}
