import { Card, CardContent } from "@/components/ui/card";

import Image from "next/image";
import Link from "next/link";

import { CardProductType, PriceType } from "@/types/product";
import CartBtn from "./cart-btn";
import { CurrencyIcon } from "./currency-icon";
import PurchaseBtn from "./purchase-btn";

export default function ProductCard({ details }: { details: CardProductType }) {
     /**
      * selected price show.
      */
     const displayPrice = details.price.find((item: PriceType) => item.select);

     return (
          <>
               <Card
                    className={`w-full border-none justify-self-start items-start rounded group relative overflow-hidden py-0 pb-3`}
               >
                    <CardContent className="h-fit p-0 w-full">
                         <Link href={`/products/${details.slug}`}>
                              <figure
                                   className={` w-full sm:h-[190px] h-[145px] mx-auto rounded-t overflow-hidden relative animate-fade animate-duration-1000 border border-neutral-800/10 border-b`}
                              >
                                   <Image
                                        src={
                                             details.thumbnail ||
                                             "/assets/logo/no-image.jpg"
                                        }
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
                                             {displayPrice.price.toFixed(2)}{" "}
                                             <CurrencyIcon
                                                  currency={details.currency}
                                             />
                                        </p>
                                   )}
                              </div>
                         </Link>
                         <div className="  flex justify-center items-center gap-x-2 w-full duration-700   sm:p-4 p-3">
                              {displayPrice && (
                                   <PurchaseBtn
                                        productId={details.id}
                                        selectedPriceId={displayPrice.variantId}
                                   />
                              )}
                              {/* cart button */}
                              {displayPrice && (
                                   <CartBtn
                                        productId={details.id}
                                        selectedPriceId={displayPrice.variantId}
                                   />
                              )}
                              {/* cart button */}
                         </div>
                    </CardContent>
               </Card>
          </>
     );
}
