'use client';

import debounce from '@/utils/debounce';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

export default function ImagePreview({ allImage, productName }) {
    const [previewImage, setPreviewImage] = useState(allImage[0]);

    function handelImagePreviewHover(img) {
        setPreviewImage(img);
    }

    const debouncedHandleImageHover = debounce(handelImagePreviewHover, 350);

    return (
        <div className=" h-fit">
            {/* preview image */}

            <figure className="h-[34.4rem]  border border-neutral-500/10 bg-slate-200/10 rounded overflow-hidden object-cover flex justify-center items-center">
                <motion.div
                    key={previewImage?.id}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -30, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-auto h-auto">
                    <Image
                        src={previewImage?.imgUrl}
                        alt={productName}
                        width={750}
                        height={550}
                        className="w-auto h-auto"
                    />
                </motion.div>
            </figure>

            <div className="flex items-center justify-center gap-4 mt-4">
                {allImage?.map((img, inx) => (
                    <div
                        onMouseOver={() => {
                            debouncedHandleImageHover(img);
                        }}
                        key={img?.id}
                        className={`${
                            previewImage?.id === img?.id
                                ? 'border-2 border-green-400'
                                : 'border-neutral-500'
                        } h-[3.3rem] w-20 overflow-hidden border rounded flex items-center justify-start duration-150`}>
                        <Image
                            src={img?.imgUrl}
                            alt={`${productName} - ${inx + 1}`}
                            width={135}
                            height={100}
                            className="w-full cursor-pointer border "
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
