import allImageArray from '@/utils/allImageArray';
import capitalizeWord from '@/utils/capitalizeWords';
import Link from 'next/link';
import CardBtn from '../_card/CardBtn';
import ImagePreview from './ImagePreview';

export default function Details({ productDetails }) {
    const {
        id,
        thumbnail,
        name,
        images,
        unit,
        size,
        price,
        category,
        shortDescription,
        description,
        offer,
    } = productDetails;

    const displayPrice = price?.find((item) => item?.select)['price'];

    return (
        <>
            <section
                key={id}
                className=" flex md:flex-nowrap flex-wrap gap-6 group relative ">
                {/* <ProductNextPreviousButton
                    productsIdArray={trendingProductIdArray}
                    local={local}
                    productId={productId}
                /> */}

                {/* image preview component */}
                {/* allImage function return array and input a single image url and images array */}
                <ImagePreview
                    allImage={allImageArray(thumbnail, images)}
                    productName={name}
                />

                <div>
                    <h2 className="md:text-3xl text-xl font-medium uppercase mb-2">
                        {name}
                    </h2>
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

                    <div className="space-y-2">
                        <p className="text-gray-800 font-semibold space-x-2">
                            <span>Unit:</span>
                            <span className="text-green-600">{unit} </span>
                        </p>
                        <p className="space-x-2">
                            <span className="text-gray-800 font-semibold">
                                Size:
                            </span>
                            <span className="text-gray-600 uppercase">
                                {size}
                            </span>
                        </p>
                        <p className="space-x-2">
                            <span className="text-gray-800 font-semibold">
                                Category :
                            </span>
                            <Link
                                href={`/products?category=${category?.categorySlug}`}>
                                <span className="text-gray-600 capitalize">
                                    {capitalizeWord(
                                        category?.categoryName?.toLowerCase()
                                    )}
                                </span>
                            </Link>
                        </p>
                        {/* <p className="space-x-2">
                            <span className="text-gray-800 font-semibold">
                                {dictionary?.singleProduct?.sku}:
                            </span>
                            <span className="text-gray-600">
                                {productDetails?.modal}
                            </span>
                        </p> */}
                    </div>
                    <div className="flex items-baseline mb-1 space-x-2 font-roboto mt-4">
                        <p className="text-xl text-primary font-semibold">
                            {displayPrice.toFixed(2)}
                        </p>

                        {/*
                            offer price
                        <p className="text-base text-gray-400 line-through">
                            ${productDetails?.price?.toFixed(2)}
                        </p> */}
                    </div>

                    <p
                        className="mt-4 text-gray-600"
                        dangerouslySetInnerHTML={{
                            __html: shortDescription,
                        }}
                    />

                    {/* btn click site */}

                    <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                        <CardBtn />
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
                <div className="w-3/5 pt-6">
                    <div
                        className="text-gray-600"
                        dangerouslySetInnerHTML={{
                            __html: description,
                        }}
                    />
                </div>
            </div>
            {/* ./description */}
        </>
    );
}
