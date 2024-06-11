'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import handelDeleteImage from './handelDeleteImage';

export default function ImagesShow({ imageUrl, type, setImageUrl, imageRef }) {
    const router = useRouter();

    if ('single' === type) {
        return (
            <>
                {imageUrl && (
                    <div className="mt-4 ">
                        <figure className="relative w-fit h-fit group">
                            <span
                                onClick={() =>
                                    handelDeleteImage(
                                        imageUrl,
                                        setImageUrl,
                                        imageRef,
                                        router
                                    )
                                }
                                className="absolute right-1 -top-1 text-xl text-red-600 group-hover:opacity-100 group-hover:scale-100 scale-0 opacity-0 duration-150 cursor-pointer">
                                &#215;
                            </span>
                            <Image
                                src={imageUrl}
                                width={100}
                                height={100}
                                alt="category image"
                                className="w-auto h-auto"
                            />
                        </figure>
                    </div>
                )}
            </>
        );
    }
}
