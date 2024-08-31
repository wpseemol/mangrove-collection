import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProductType } from '@/types/mongoose-models';
import { CurrencyIcon } from '@/utils/currency-icon';
import wordEllipsis from '@/utils/word-ellipsis';
import Image from 'next/image';
import CustomLink from './custom-link';

type WhichType = 'products-page';

export default function ProductCard({
    details,
    which,
}: {
    details: ProductType;
    which?: WhichType;
}) {
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
        <>
            <Card
                className={`${
                    which === 'products-page' ? 'sm:w-[230px]' : 'sm:w-[250px]'
                }  h-fit w-[260px]  justify-self-center rounded group relative overflow-hidden`}>
                <CardContent className="h-fit p-0">
                    <CustomLink href={`/products/${details.slug}`}>
                        <figure
                            className={`${
                                which === 'products-page'
                                    ? 'sm:h-[230px]'
                                    : 'sm:h-[250px]'
                            } w-full h-[260px] mx-auto rounded-t overflow-hidden relative animate-fade animate-duration-1000`}>
                            <Image
                                src={details.thumbnail}
                                alt={details.name}
                                width={145}
                                height={145}
                                className={`${
                                    imageUrl ? 'group-hover:z-[0]' : ''
                                } object-cover object-center w-full h-full group-hover:scale-105 duration-500 z-[2] absolute top-0 left-0 bg-white border-b border`}
                            />
                            {imageUrl && (
                                <Image
                                    src={imageUrl}
                                    alt={details.name}
                                    width={145}
                                    height={145}
                                    className="object-cover object-center w-full h-full duration-500 group-hover:scale-105 absolute top-0 left-0 z-[1] bg-white border border-b"
                                />
                            )}
                        </figure>
                        <div className="animate-fade-up animate-once animate-duration-1000 h-[130px] w-full px-2 mt-1 flex flex-col items-center">
                            <h2 className="max-h-[63px] overflow-hidden font-normal md:text-lg text-base text-ellipsis text-center group-hover:text-primary-foreground capitalize group-hover:underline duration-150">
                                {wordEllipsis(details.name.toLocaleLowerCase())}
                            </h2>

                            <p className="font-medium flex justify-center items-center gap-x-1">
                                {displayPrice?.price.toFixed(2)}{' '}
                                <CurrencyIcon currency={details.currency} />
                            </p>
                        </div>
                    </CustomLink>
                    <div className="absolute group-hover:bottom-0 left-0 -bottom-20 flex justify-center items-center gap-x-2 w-full duration-700 backdrop-blur bg-green-700/5 border-t p-5 ">
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
                </CardContent>
            </Card>
        </>
    );
}
