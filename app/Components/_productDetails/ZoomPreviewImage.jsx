'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';

export default function ZoomPreviewImage({ previewImage, productName }) {
    const zoomTargetRef = useRef(null);
    const imageHoverContainerRef = useRef(null);

    return (
        <>
            <motion.figure
                key={previewImage?.id}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -30, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-[34.4rem]  border border-neutral-500/10 bg-slate-200/10 rounded overflow-hidden object-cover flex justify-center items-center">
                <Image
                    src={previewImage?.imgUrl}
                    alt={productName}
                    width={750}
                    height={550}
                    className="w-auto h-auto"
                />
            </motion.figure>

            <figure className="absolute -top-8 right-20">
                <Image
                    src={previewImage?.imgUrl}
                    alt={productName}
                    width={750}
                    height={550}
                    className="w-auto h-auto"
                />
            </figure>
        </>
    );
}
