import Image from 'next/image';

export default function ImagePreview({ images, thumbnail, productName }) {
    return (
        <div className="border h-fit">
            <figure>
                <Image
                    src={thumbnail}
                    alt={productName}
                    width={750}
                    height={550}
                    className="w-full"
                />
            </figure>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
                <figure className="h-[3.3rem] w-20 overflow-hidden border border-primary flex items-center justify-start">
                    <Image
                        src={thumbnail}
                        alt={productName}
                        width={135}
                        height={100}
                        className="w-full cursor-pointer "
                    />
                </figure>
                {images?.map((img, inx) => (
                    <figure
                        key={img}
                        className="h-[3.3rem] w-20 overflow-hidden border border-neutral-500 flex items-center justify-start">
                        <Image
                            src={img}
                            alt={`${productName} - ${inx + 1}`}
                            width={135}
                            height={100}
                            className="w-full cursor-pointer border "
                        />
                    </figure>
                ))}
            </div>
        </div>
    );
}
