import currencyIcon from '@/utils/currencyIcon';
import Image from 'next/image';
import Link from 'next/link';
import AnimationLink from '../page-change-animation/animation-link';
import CardBtn from './CardBtn';

export default function ListViewCard({ productDetails }) {
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
    } = productDetails;

    const hrefLink = `/products/${slug}`;

    const displayPrice = price?.find((item) => item?.select)['price'];

    return (
        <div
            className="w-full shadow hover:shadow-lg grid lg:grid-cols-4 md:grid-cols-4 sm:grid-cols-3 grid-cols-1 items-center gap-4 lg:h-[17.5rem] md:h-[12rem] h-[17.5rem]
        duration-200 border border-neutral-700/10
        ">
            <AnimationLink
                isActive={false}
                href={hrefLink}
                className="animate-fade animate-duration-1000 col-span-1 w-full h-full overflow-hidden flex justify-center items-center border-r">
                <figure className="">
                    <Image
                        src={thumbnail}
                        width={300}
                        height={300}
                        className="w-auto"
                        alt={name}
                    />
                </figure>
            </AnimationLink>
            <div className=" animate-fade-left animate-duration-1000 md:col-span-3 sm:col-span-2  w-full">
                <Link href={`/products?category=${category?.slug}`}>
                    <p className="text-xs font-extralight hover:text-primaryColor duration-200 text-[#999]">
                        {category?.name}
                    </p>
                </Link>
                <Link href={hrefLink}>
                    <h2 className="text-[28px] font-medium my-2">{name}</h2>
                </Link>
                <p className=" text-green-800 mb-2">
                    <span>{currencyIcon(currency)}</span>{' '}
                    {displayPrice?.toFixed(2)}{' '}
                    <span className="font-semibold">({unit})</span>
                </p>
                <Link href={hrefLink}>
                    <p className="text-[#585858] text-base mb-2">
                        {shortDescription}
                    </p>
                </Link>

                <div className="flex items-center gap-3 ">
                    <CardBtn />
                </div>
            </div>
        </div>
    );
}
