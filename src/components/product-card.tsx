import { Card, CardContent } from '@/components/ui/card';
import { CardProductType, PriceType } from '@/types/product';
import Image from 'next/image';
import Link from 'next/link';
import { CurrencyIcon } from './currency-icon';
import { Button } from './ui/button';

export default function ProductCard({ details }: { details: CardProductType }) {
    /**
     * selected price show.
     */
    const displayPrice = details.price.find((item: PriceType) => item.select);

    /**
     * image url random change every reload.
     */
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
        <>
            <Card
                className={` h-fit w-full justify-self-center rounded group relative overflow-hidden`}>
                <CardContent className="h-fit p-0">
                    <Link href={`/products/${details.slug}`}>
                        <figure
                            className={` w-full sm:h-[190px] h-[145px] mx-auto rounded-t overflow-hidden relative animate-fade animate-duration-1000 border border-b`}>
                            <Image
                                src={details.thumbnail}
                                alt={details.name}
                                width={145}
                                height={145}
                                className={`${
                                    imageUrl ? 'group-hover:z-[0]' : ''
                                } object-cover object-center w-full h-full group-hover:scale-105 duration-500 z-[2] absolute top-0 left-0 bg-white`}
                            />
                            {imageUrl && (
                                <Image
                                    src={imageUrl}
                                    alt={details.name}
                                    width={145}
                                    height={145}
                                    className="object-cover object-center w-full h-full duration-500 group-hover:scale-105 absolute top-0 left-0 z-[1] bg-white"
                                />
                            )}
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
                        <Button
                            variant="default"
                            size="sm"
                            className="text-neutral-100 hover:bg-primary-foreground 
                            group-hover:animate-jump animate-once animate-duration-[3000ms]
                            shadow-xl">
                            <span className="hidden sm:inline ">Buy Now</span>
                            <span className="sm:hidden">Buy</span>
                        </Button>{' '}
                        <Button
                            variant="default"
                            size="sm"
                            className="text-neutral-100 hover:bg-primary-foreground">
                            <span className="hidden sm:inline">
                                Add to Cart
                            </span>
                            <span className="sm:hidden">Cart</span>
                        </Button>{' '}
                        {/* <CartButton
                            productId={details.slug}
                            variant="outline"
                            size="sm"
                            className="px-5 sm:w-fit w-[60px]">
                            <>
                                <span className="hidden sm:inline">
                                    Add to Cart
                                </span>
                                <span className="sm:hidden">Cart</span>
                            </>
                        </CartButton> */}
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
