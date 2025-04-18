import { Card, CardContent } from '@/components/ui/card';

import Image from 'next/image';
import Link from 'next/link';



import { CardProductType, PriceType } from '@/types/product';
import { CurrencyIcon } from './currency-icon';

export default function ProductCard({ details }: { details: CardProductType }) {
    /**
     * selected price show.
     */
    const displayPrice = details.price.find((item: PriceType) => item.select);

    return (
        <>
            <Card
                className={` h-fit w-full border border-neutral-800/10 justify-self-center rounded group relative overflow-hidden`}>
                <CardContent className="h-fit p-0">
                    <Link href={`/products/${details.slug}`}>
                        <figure
                            className={` w-full sm:h-[190px] h-[145px] mx-auto rounded-t overflow-hidden relative animate-fade animate-duration-1000 border border-b`}>
                            <Image
                                src={details.thumbnail}
                                alt={details.name}
                                width={145}
                                height={145}
                                className={`object-cover object-center w-full h-full group-hover:scale-105 duration-500 bg-white`}
                            />
                        </figure>
                        <div className="animate-fade-up animate-once animate-duration-1000 w-full px-2 mt-1 flex flex-col items-center">
                            <h2 className="max-h-[63px] overflow-hidden font-normal md:text-lg text-base text-ellipsis text-center group-hover:text-primary-foreground capitalize group-hover:underline duration-150">
                                {details.name.toLocaleLowerCase()}
                            </h2>

                            {displayPrice && (
                                <p className="font-normal flex justify-center items-center gap-x-1 ">
                                    {displayPrice.price.toFixed(2)}{' '}
                                    <CurrencyIcon currency={details.currency} />
                                </p>
                            )}
                        </div>
                    </Link>
                    <div className="  flex justify-center items-center gap-x-2 w-full duration-700   sm:p-4 p-3">
                        {/* <PurchaseButton productId={details.id} /> */}
                        {/* cart button */}
                        {/* <CartButton productId={details.id} /> */}
                        {/* cart button */}
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
