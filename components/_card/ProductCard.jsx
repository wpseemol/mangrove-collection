import ForAnimate from '@/components/Client/ForAnimate/ForAnimate';
import currencyIcon from '@/utils/currencyIcon';
import titleWordClops from '@/utils/titleWordClops';
import Image from 'next/image';
import AnimationLink from '../page-change-animation/animation-link';
import CardBtn from './CardBtn';

export default function ProductCard({ productDetails }) {
    const { thumbnail, name, slug, price, currency, unit, category } =
        productDetails;

    const categoryName = category?.categoryName;

    const slugUrl = `/products/${slug}`;

    const displayPrice = price?.find((item) => item?.select)['price'];

    return (
        <ForAnimate
            className="border border-neutral-300/30 group hover:shadow-lg duration-300 sm:w-64 max-w-72 relative h-[23rem] overflow-hidden"
            animateClassName={'animate-fade-up'}>
            <AnimationLink href={slugUrl} isActive={false}>
                <figure className="mx-auto w-full h-[14rem] overflow-hidden flex justify-center items-center px-2 pt-4">
                    <Image
                        src={thumbnail}
                        width={250}
                        height={250}
                        alt="Product Name"
                        className="w-auto h-auto object-cover group-hover:scale-105 duration-500"
                    />
                </figure>
            </AnimationLink>

            <AnimationLink
                href={slugUrl}
                isActive={false}
                className="hidden md:inline">
                <div className="text-center px-3 py-4">
                    <h3 className="font-bold animate-fade-up text-sm animate-duration-[800ms]">
                        {categoryName ? categoryName : 'Uncategorized product'}
                    </h3>
                    <h2 className="animate-fade-up animate-duration-[900ms]">
                        {titleWordClops(name)}
                    </h2>

                    <p className="animate-fade-up animate-duration-1000">
                        <span>{currencyIcon(currency)}</span>{' '}
                        {displayPrice?.toFixed(2)}{' '}
                        <span className="font-semibold">({unit})</span>
                    </p>
                </div>
            </AnimationLink>
            {/* mobile view */}
            <div className="text-center px-3 py-4 md:hidden block">
                <h3 className="font-bold text-sm animate-fade-up animate-duration-100">
                    {categoryName ? categoryName : 'Uncategorized product'}
                </h3>
                <h2 className="animate-fade-up animate-duration-200">
                    {titleWordClops(name)}
                </h2>

                <p className="animate-fade-up animate-duration-300">
                    <span className="">{currencyIcon(currency)}</span>
                    {displayPrice?.toFixed(2)}{' '}
                    <span className="font-semibold">(1{unit})</span>
                </p>
            </div>

            <div className="absolute bg-slate-500/60 flex w-full justify-center items-center gap-3 h-32 -bottom-36 group-hover:bottom-0 left-0 duration-300">
                <CardBtn />
            </div>
        </ForAnimate>
    );
}
