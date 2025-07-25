import { CurrencyIcon } from "@/components/currency-icon";
import { Price, ProductDetailsType } from "@/types/mongoose/product";
import Link from "next/link";
import DetailsBuyBtn from "./details-buy-btn";
import DetailsCartBtn from "./details-cart-btn";
import "./details-tiptap-style.css";
import PriceSection from "./price-section";
import ProductImages from "./product-images";
import QuantityCounter from "./quntity-counter";
import SelectedVariant from "./selected-variant";
import SocialShareBtn from "./social-share-btn";

export default function ProductDetails({
     details,
}: {
     details: ProductDetailsType;
}) {
     const displayPrice = details.price.find((item) => item.select);

     const displayVariant = Array.from(
          new Set(details.variants.map((item) => item.type))
     );

     return (
          <section>
               <div
                    key={details.id}
                    className="flex md:flex-nowrap justify-center flex-wrap gap-6 group relative md:text-start text-center md:mx-14 mt-6  "
               >
                    {/* image preview component */}
                    {/* allImage function return array and input a single image url and images array */}
                    <ProductImages
                         allImage={JSON.stringify(
                              allImageArray(
                                   details.thumbnail ||
                                        "/assets/logo/no-image.jpg",
                                   details.images
                              )
                         )}
                         productName={details.name}
                    />
                    <div className="flex flex-col gap-y-3 w-full ">
                         <h2 className="md:text-3xl text-xl font-medium capitalize group-hover:underline group-hover:underline-offset-4 group-hover:text-primary-foreground duration-200">
                              {details.name}
                         </h2>

                         {/* price section */}
                         <div className="flex md:justify-start justify-center items-baseline font-roboto">
                              <p className="text-xl text-primary font-semibold">
                                   {displayPrice && (
                                        <PriceSection
                                             displayPrice={displayPrice.price}
                                             priceVariants={JSON.stringify(
                                                  details.price
                                             )}
                                        />
                                   )}
                                   <CurrencyIcon currency={details.currency} />{" "}
                              </p>

                              {/*
                            offer price
                        <p className="text-base text-gray-400 line-through">
                            ${productDetails?.price?.toFixed(2)}
                        </p> */}
                         </div>
                         {/* price section */}

                         {/* category section */}
                         <p className="">
                              <span className="text-gray-800 font-semibold">
                                   Category :{" "}
                              </span>

                              <Link
                                   href={`/products?category=${details.category.slug}`}
                              >
                                   <span className="text-gray-600 capitalize">
                                        {details.category.name.toLowerCase()}
                                   </span>
                              </Link>
                         </p>
                         {/* category section */}

                         {/* <div className="flex items-center mb-4">
                              <div
                                   className="flex gap-1 text-sm text-yellow-400"
                                   title={`rating Number ${productDetails?.rating}`}
                              >
                                   {ratingArrayGenerate(
                                        productDetails?.rating
                                   )?.map((item) => (
                                        <FaStar key={item} />
                                   ))}
                              </div>
                              <div className="text-xs text-gray-500 ml-3">
                                   (150 Reviews)
                              </div>
                         </div> */}

                         <p className="text-gray-800 font-semibold space-x-2">
                              <span>Unit:</span>
                              <span className="text-green-600">
                                   {details.unit}{" "}
                              </span>
                         </p>
                         {/* variant section */}
                         {displayVariant?.length > 0 &&
                              displayVariant?.map((variant) => (
                                   <p key={variant} className="space-x-2">
                                        <span className="text-gray-800 font-semibold capitalize">
                                             {variant}:
                                        </span>
                                        <SelectedVariant
                                             type={variant}
                                             variants={JSON.stringify(
                                                  details.variants
                                             )}
                                             displayPrice={JSON.stringify(
                                                  displayPrice as Price
                                             )}
                                        />
                                   </p>
                              ))}
                         {/* variant section */}

                         {/* <p className="space-x-2">
                            <span className="text-gray-800 font-semibold">
                                {dictionary?.singleProduct?.sku}:
                            </span>
                            <span className="text-gray-600">
                                {productDetails?.modal}
                            </span>
                        </p> */}

                         <p
                              className="mt-4 text-gray-600"
                              dangerouslySetInnerHTML={{
                                   __html: details.shortDescription || "",
                              }}
                         />

                         {/* btn click site */}
                         <div>
                              <QuantityCounter />
                         </div>

                         <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                              {/* bye button */}
                              {displayPrice && (
                                   <DetailsBuyBtn
                                        productId={details.id}
                                        selectedPriceId={displayPrice.variantId}
                                   />
                              )}
                              {/* bye button */}
                              {/* cart button */}
                              {displayPrice && (
                                   <DetailsCartBtn
                                        productId={details.id}
                                        selectedPriceId={displayPrice.variantId}
                                   />
                              )}
                              {/* cart button */}
                         </div>

                         {/* <div className="mt-4">
                        <h3 className="text-sm text-gray-800 uppercase mb-1">
                            {dictionary?.singleProduct?.quantity}
                        </h3>
                        <SinglePageQuantity
                            availableQuantity={productDetails?.quantity}
                        />
                    </div> */}

                         {/* <div className="mt-6 flex gap-3 border-b border-gray-200 pb-5 pt-5"> */}
                         {/* single page add to cart btn */}
                         {/* <SinglePageAddToCart
                            availableQuantity={productDetails?.quantity}
                            loginUserId={loginUserId?.loginUserId}
                            productId={productId}
                        /> */}
                         {/* wish list btn */}
                         {/* <WishlistBtnDetailsPage
                            wishlistProductIdArray={WishlistProductArray}
                            loginUserId={loginUserId}
                            productId={productId}
                        /> */}
                         {/* </div> */}
                         {/* btn click site */}

                         <SocialShareBtn
                              title={details.name}
                              description={details.description}
                         />
                    </div>
               </div>

               {/*  description  */}
               <div className="pb-16 mt-2">
                    <h3 className="border-b border-gray-200 font-roboto text-gray-800 pb-3 font-medium text-center md:text-left">
                         Description
                    </h3>
                    <div className=" mx-4 pt-6 text-gray-600 md:mx-0 sm:mx-auto">
                         <div
                              className="tiptap"
                              dangerouslySetInnerHTML={{
                                   __html: details.description,
                              }}
                         />
                    </div>
               </div>
               {/* description */}
          </section>
     );
}

interface ImageType {
     id: string;
     imgUrl: string;
}

export function allImageArray(
     thumbnail: string,
     images?: ImageType[]
): ImageType[] {
     let allImage: ImageType[] = [];

     if (thumbnail) {
          allImage.push({
               id: crypto.randomUUID(),
               imgUrl: thumbnail || "/assets/logo/no-image.jpg",
          });
     }

     if (images) {
          allImage = [...allImage, ...images];
     }

     return allImage;
}
