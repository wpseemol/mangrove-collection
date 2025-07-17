"use client";
import { motion } from "framer-motion";
import Image from "next/image";

interface ZoomPreviewImageType {
     previewImage: ImageType;
     productName: string;
}

export default function PreviewImageWithZoom({
     previewImage,
     productName,
}: ZoomPreviewImageType) {
     return (
          <>
               <motion.figure
                    key={previewImage.id}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -30, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="2xl:w-[400px] 2xl:h-[400px] md:h-[350px] h-[300px] md:w-[350px] w-[300px] border border-neutral-500/10 bg-slate-200/10 rounded overflow-hidden hidden md:block"
               >
                    <Image
                         src={
                              previewImage.imgUrl || "/assets/logo/no-image.jpg"
                         }
                         alt={productName}
                         width={400}
                         height={400}
                         className="object-cover object-center 2xl:w-[400px] 2xl:h-[400px] md:h-[350px] h-[300px] md:w-[350px] w-[300px]"
                    />
               </motion.figure>
          </>
     );
}

interface ImageType {
     id: string;
     imgUrl: string;
}
