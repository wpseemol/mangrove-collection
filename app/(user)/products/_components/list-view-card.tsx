import CustomLink from '@/components/custom-link';
import { Button } from '@/components/ui/button';
import { CategoryWithMongo_Id, ProductType } from '@/types/mongoose-models';
import { CurrencyIcon } from '@/utils/currency-icon';
import Image from 'next/image';
import Link from 'next/link';

export default function ListViewProductCard({
    details,
}: {
    details: ProductType;
}) {
    const {
        name,
        category,
        offer,
        shortDescription,
        currency,
        price,
        unit,
        slug,
        thumbnail,
    } = details;

    const categoryType = category as CategoryWithMongo_Id;

    const displayPrice = details.price.find((item) => item.select);

    let imageUrl: string | null;

    if (details.images && details.images.length > 0) {
        const randomIndex: number = Math.floor(
            Math.random() * details.images.length
        );
        imageUrl = details.images[randomIndex].imgUrl;
    } else {
        imageUrl = null;
    }

    return (
        details && (
            <div
                className="md:w-full sm:w-80 w-72 md:mx-0 mx-auto shadow hover:shadow-lg flex md:flex-row flex-col items-center gap-4 lg:h-[15.5rem] md:h-[12rem] h-fit
        duration-200 border border-neutral-700/10 group
        ">
                <CustomLink
                    isActive={false}
                    href={`/products/${slug}`}
                    className="animate-fade animate-duration-1000 border-r">
                    <figure className="lg:w-[15.5rem] md:w-[12rem] sm:w-80 w-72 lg:h-[15.5rem] md:h-[12rem] sm:h-80 h-72 overflow-hidden relative ">
                        <Image
                            src={details.thumbnail}
                            alt={details.name}
                            width={145}
                            height={145}
                            className={`${
                                imageUrl ? 'group-hover:z-[0]' : ''
                            } object-cover object-center w-full h-full group-hover:scale-105 duration-500 z-[2] absolute top-0 left-0`}
                        />
                        {imageUrl && (
                            <Image
                                src={imageUrl}
                                alt={details.name}
                                width={145}
                                height={145}
                                className="object-cover object-center w-full h-full duration-500 group-hover:scale-105 absolute top-0 left-0 z-[1]"
                            />
                        )}
                    </figure>
                </CustomLink>
                <div className="animate-fade-left animate-duration-1000 md:col-span-3 sm:col-span-2  w-full md:p-0 p-3">
                    <Link href={`/products?category=${categoryType.slug}`}>
                        <p className="text-xs font-extralight hover:text-primaryColor duration-200 text-[#999]">
                            {categoryType.name}
                        </p>
                    </Link>
                    <Link href={`/products/${slug}`}>
                        <h2 className="md:text-[28px] text-xl font-medium my-2">
                            {name}
                        </h2>
                    </Link>
                    <p className=" text-green-800 mb-2">
                        <CurrencyIcon currency={details.currency} />{' '}
                        {displayPrice?.price.toFixed(2)}{' '}
                        <span className="font-semibold">({unit})</span>
                    </p>
                    <Link href={`/products/${slug}`}>
                        <p className="text-[#585858] text-base mb-2">
                            {shortDescription}
                        </p>
                    </Link>

                    <div className="flex items-center gap-3 ">
                        <Button
                            variant="default"
                            size="sm"
                            className="text-neutral-100 hover:bg-primary-foreground px-5">
                            Buy Now
                        </Button>{' '}
                        <Button variant="outline" size="sm" className="px-5 ">
                            Add to Cart
                        </Button>
                    </div>
                </div>
            </div>
        )
    );
}
