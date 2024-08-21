import CustomLink from '@/components/custom-link';
import { ProductDetailsType } from '@/types/products';
import { CurrencyIcon } from '@/utils/currency-icon';
import PriceSection from './price-section';
import SelectedVariant from './selected-variant';

export default function Details({ details }: { details: ProductDetailsType }) {
    let displayPrice = details.price.find((item) => item.select);

    const displayVariant = Array.from(
        new Set(details.variants?.map((item) => item.type))
    );

    return (
        <section>
            <>
                <section
                    key={details.id}
                    className=" flex md:flex-nowrap flex-wrap gap-6 group relative ">
                    {/* <ProductNextPreviousButton
                    productsIdArray={trendingProductIdArray}
                    local={local}
                    productId={productId}
                /> */}

                    {/* image preview component */}
                    {/* allImage function return array and input a single image url and images array */}
                    {/* <ImagePreview
                        allImage={allImageArray(thumbnail, images)}
                        productName={name}
                    /> */}

                    <div className="flex flex-col gap-y-3">
                        <h2 className="md:text-3xl text-xl font-medium capitalize">
                            {details.name}
                        </h2>

                        {/* price section */}
                        <div className="flex items-baseline font-roboto">
                            <p className="text-xl text-primary font-semibold">
                                {displayPrice && (
                                    <PriceSection
                                        displayPrice={displayPrice.price}
                                        priceVariants={details.price}
                                    />
                                )}
                                <CurrencyIcon currency={details.currency} />{' '}
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
                                Category :
                            </span>
                            <CustomLink href={`/products?category=${'slug'}`}>
                                <span className="text-gray-600 capitalize">
                                    {'category name'}
                                </span>
                            </CustomLink>
                        </p>
                        {/* category section */}

                        {/* 
                    <div className="flex items-center mb-4">
                        <div
                            className="flex gap-1 text-sm text-yellow-400"
                            title={`rating Number ${productDetails?.rating}`}>
                            {ratingArrayGenerate(productDetails?.rating)?.map(
                                (item) => (
                                    <FaStar key={item} />
                                )
                            )}
                        </div>
                         <div className="text-xs text-gray-500 ml-3">
                            (150 Reviews)
                        </div> 
                    </div>
                    */}

                        <p className="text-gray-800 font-semibold space-x-2">
                            <span>Unit:</span>
                            <span className="text-green-600">
                                {details.unit}{' '}
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
                                        variants={details.variants}
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
                                __html: details.shortDescription || '',
                            }}
                        />

                        {/* btn click site */}

                        <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                            {/* <CardBtn /> */}
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

                        {/* <SocialShareBtn
                        title={productDetails?.name}
                        description={productDetails?.description}
                    /> */}
                    </div>
                </section>
                {/* ./product-detail */}

                {/*  description  */}
                <div className="pb-16 mt-2">
                    <h3 className="border-b border-gray-200 font-roboto text-gray-800 pb-3 font-medium text-center md:text-left">
                        Description
                    </h3>
                    <div className="w-3/5 pt-6 text-gray-600">
                        <div
                            className="quill-content"
                            dangerouslySetInnerHTML={{
                                __html: details.description,
                            }}
                        />
                    </div>
                </div>
                {/* ./description */}
            </>
        </section>
    );
}
