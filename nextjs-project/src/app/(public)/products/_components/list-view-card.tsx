import CartBtn from "@/components/cart-btn";
import { CurrencyIcon } from "@/components/currency-icon";
import PurchaseBtn from "@/components/purchase-btn";
import { CardProductType, PriceType } from "@/types/product";

import Image from "next/image";
import Link from "next/link";

export default function ListViewProductCard({
     details,
}: {
     details: CardProductType;
}) {
     /**
      * selected price show.
      */
     const displayPrice = details.price.find((item: PriceType) => item.select);

     return (
          details && (
               <div
                    className="md:w-full sm:w-80 w-72 md:mx-0 mx-auto shadow hover:shadow-lg flex md:flex-row flex-col items-center gap-4 lg:h-[15.5rem] md:h-[12rem] h-fit
        duration-200 border border-neutral-700/10 group rounded overflow-hidden
        "
               >
                    <Link
                         href={`/products/${details.slug}`}
                         className="animate-fade animate-duration-1000 border-r border-neutral-800/10"
                    >
                         <figure className="lg:w-[15.5rem] md:w-[12rem] sm:w-80 w-72 lg:h-[15.5rem] md:h-[12rem] sm:h-80 h-72 overflow-hidden relative ">
                              <Image
                                   src={
                                        details.thumbnail ||
                                        "/assets/logo/no-image.jpg"
                                   }
                                   alt={details.name}
                                   width={145}
                                   height={145}
                                   className={` object-cover object-center w-full h-full group-hover:scale-105 duration-500 z-[2] absolute top-0 left-0`}
                              />
                         </figure>
                    </Link>
                    <div className="animate-fade-left animate-duration-1000 md:col-span-3 sm:col-span-2  w-full md:p-0 p-3">
                         <Link
                              href={`/products?category=${details.category.slug}`}
                         >
                              <p className="text-xs font-extralight hover:text-primaryColor duration-200 text-[#4d4d4d]">
                                   {/* {categoryType.name} */}
                                   {details.category.name}
                              </p>
                         </Link>
                         <Link href={`/products/${details.slug}`}>
                              <h2 className="md:text-[28px] text-xl font-medium my-2">
                                   {details.name}
                              </h2>
                         </Link>
                         <p className=" text-green-800 mb-2 font-normal">
                              {displayPrice && (
                                   <>
                                        {displayPrice.price.toFixed(2)}{" "}
                                        <CurrencyIcon
                                             currency={details.currency}
                                        />
                                   </>
                              )}
                         </p>
                         <Link href={`/products/${details.slug}`}>
                              <p className="text-[#585858] text-base mb-2">
                                   {details.shortDescription}
                              </p>
                         </Link>

                         <div className="flex items-center gap-3 ">
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
                    </div>
               </div>
          )
     );
}
