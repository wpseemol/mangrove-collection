'use client';
import { useZoomImageHover } from '@zoom-image/react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import MobileViewSlider from './MobileViewSlider';

export default function ZoomPreviewImage({
    previewImage,
    productName,
    allImage,
}) {
    const zoomTargetRef = useRef(null);
    const imageHoverContainerRef = useRef(null);

    const [zoomImageTarget, setZoomImageTarget] = useState(false);

    const { createZoomImage: createZoomImageHover } = useZoomImageHover();

    useEffect(() => {
        const imageContainer = imageHoverContainerRef?.current;
        const zoomTarget = zoomTargetRef?.current;
        if (imageContainer && zoomTarget) {
            createZoomImageHover(imageContainer, {
                zoomImageSource: previewImage?.imgUrl,
                customZoom: { width: 720, height: 500 },
                zoomTarget,
                scale: 5.3,
                zoomTargetClass: 'shadow-md',
            });
        }

        const handleMouseEnter = () => {
            zoomTarget.classList.remove('hidden');
            zoomTarget.classList.add('md:block');
        };

        const handleMouseLeave = () => {
            zoomTarget.classList.remove('md:block');
            zoomTarget.classList.add('hidden');
        };

        imageContainer.addEventListener('mouseenter', handleMouseEnter);
        imageContainer.addEventListener('mouseleave', handleMouseLeave);

        // Cleanup event listeners on unmount
        return () => {
            imageContainer.removeEventListener('mouseenter', handleMouseEnter);
            imageContainer.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [createZoomImageHover, previewImage?.imgUrl]);

    return (
        <>
            <motion.figure
                key={previewImage?.id}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -30, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className=" lg:w-[500px] lg:h-[500px] md:h-[350px] h-[300px] md:w-[350px] w-[300px] border border-neutral-500/10 bg-slate-200/10 rounded overflow-hidden object-cover hidden md:block"
                ref={imageHoverContainerRef}>
                <Image
                    src={previewImage?.imgUrl}
                    alt={productName}
                    width={500}
                    height={500}
                    className="w-auto h-auto"
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
