'use client';
import { useZoomImageHover } from '@zoom-image/react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useRef } from 'react';

export default function ZoomPreviewImage({ previewImage, productName }) {
    const zoomTargetRef = useRef(null);
    const imageHoverContainerRef = useRef(null);

    const { createZoomImage: createZoomImageHover } = useZoomImageHover();

    useEffect(() => {
        const imageContainer = imageHoverContainerRef?.current;
        const zoomTarget = zoomTargetRef?.current;
        if (imageContainer && zoomTarget) {
            createZoomImageHover(imageContainer, {
                zoomImageSource: previewImage?.imgUrl,
                customZoom: { width: 400, height: 500 },
                zoomTarget,
                scale: 2,
            });
        }
    }, [createZoomImageHover, previewImage?.imgUrl]);

    return (
        <>
            <motion.figure
                key={previewImage?.id}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -30, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-[31.25rem] w-[45rem] border border-neutral-500/10 bg-slate-200/10 rounded overflow-hidden object-cover"
                ref={imageHoverContainerRef}>
                <Image
                    src={previewImage?.imgUrl}
                    alt={productName}
                    width={720}
                    height={500}
                    className="w-auto h-auto"
                />
            </motion.figure>

            <figure
                className="absolute -top-8 right-20"
                ref={zoomTargetRef}></figure>
        </>
    );
}
