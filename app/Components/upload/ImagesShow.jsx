'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import handelDeleteImage from './handelDeleteImage';
import handelMultiImageToDeleted from './handelMultiImageToDeleted';

export default function ImagesShow({
    imageUrl,
    type,
    setImageUrl,
    imageRef,
    basketPathName,
}) {
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
                                        router,
                                        basketPathName
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
    } else if ('multi' === type) {
        return (
            <>
                {imageUrl && (
                    <div className="mt-4 flex gap-2">
                        {imageUrl?.map((img) => (
                            <figure
                                key={img}
                                className="relative w-fit h-fit group bg-slate-400">
                                <span
                                    onClick={() =>
                                        handelMultiImageToDeleted(
                                            img,
                                            setImageUrl,
                                            router,
                                            imageRef,
                                            basketPathName,
                                            imageUrl?.length
                                        )
                                    }
                                    className="absolute right-1 -top-1 text-xl text-red-600 group-hover:opacity-100 group-hover:scale-100 scale-0 opacity-0 duration-150 cursor-pointer">
                                    &#215;
                                </span>
                                <Image
                                    src={img}
                                    width={100}
                                    height={100}
                                    alt="category image"
                                    className="w-[100px] h-16 object-cover object-center"
                                />
                            </figure>
                        ))}
                    </div>
                )}
            </>
        );
    }
}
