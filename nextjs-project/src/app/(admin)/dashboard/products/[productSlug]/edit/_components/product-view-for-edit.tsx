"use client";

import { ProductDetailsType } from "@/types/mongoose/product";
import Image from "next/image";
import { PopupDialog } from "./popup-dialog";
import ProductEditContainer from "./product-edit-container";
import { InfoIcon, OnCheckmark } from "./svg";
import "./tiptap-style.css";
import ProductCategoryForm from "./update-form/product-category-form";
import ProductDescriptionForm from "./update-form/product-description-form";
import ProductImagesForm from "./update-form/product-images-form";
import ProductNameForm from "./update-form/product-name-form";
import ProductPriceVariantForm from "./update-form/product-price-variant-form";
import ProductShortDescriptionForm from "./update-form/product-short-description-form";
import ProductSlugForm from "./update-form/product-slug-form";
import ProductTagsForm from "./update-form/product-tags-form";
import ProductThumbnailForm from "./update-form/product-thumbnail-form";
import ProductUnitForm from "./update-form/product-unit-form";
import ProductShippingCostForm from "./update-form/product-shipping-cost-form";

export default function ProductViewForEdit({
    stringDetails,
}: {
    stringDetails: string;
}) {
    const productDetails = JSON.parse(stringDetails) as ProductDetailsType;

    return (
        <div className="grid md:grid-cols-3 grid-cols-1 gap-4 md:mx-5 mb-5">
            <div className="md:col-span-2">
                <ProductEditContainer
                    title="Product information"
                    id="product-information"
                >
                    <div className="space-y-3">
                        {/* product name */}
                        <div className="bg-gray-600/10 md:px-2 px-1 md:py-3 py-1 rounded">
                            <h3 className="text-xl font-semibold mb-2">
                                Product Name
                            </h3>
                            <div className="flex items-center justify-between px-2 border border-gray-800/10 rounded bg-white">
                                <p>{productDetails.name}</p>{" "}
                                <PopupDialog title="Update Product name.">
                                    <ProductNameForm
                                        content={productDetails.name}
                                        productId={productDetails.id}
                                    />
                                </PopupDialog>
                            </div>
                        </div>
                        {/* product slug  */}
                        <div className="flex items-center ">
                            <div className="w-2/3 bg-gray-600/10 md:px-2 px-1 md:py-3 py-1 rounded">
                                <h3 className="text-lg font-semibold mb-2">
                                    Slug
                                </h3>
                                <div className="flex items-center justify-between px-2 border border-gray-800/10 rounded bg-white">
                                    <p>{productDetails.slug}</p>{" "}
                                    <PopupDialog title="Update Product slug.">
                                        <ProductSlugForm
                                            content={productDetails.slug}
                                            productId={productDetails.id}
                                        />
                                    </PopupDialog>
                                </div>
                            </div>

                            {/* product unit */}
                            <div className="ml-2 w-1/3 bg-gray-600/10 md:px-2 px-1 md:py-3 py-1 rounded">
                                <h3 className="text-lg font-semibold">Unit</h3>
                                <div className="flex items-center justify-between px-2 border border-gray-800/10 rounded bg-white">
                                    <p className="uppercase">
                                        {productDetails.unit}
                                    </p>{" "}
                                    <PopupDialog title="Update Product unit.">
                                        <ProductUnitForm
                                            content={productDetails.unit}
                                            productId={productDetails.id}
                                        />
                                    </PopupDialog>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-600/10 md:px-2 px-1 md:py-3 py-1 rounded">
                            {/* product description  */}
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-semibold mb-2">
                                    Product Description
                                </h3>
                                <PopupDialog
                                    title="Update Product Description."
                                    withFit={true}
                                >
                                    <ProductDescriptionForm
                                        content={
                                            productDetails.description || ""
                                        }
                                        productId={productDetails.id}
                                    />
                                </PopupDialog>
                            </div>
                            <div className="flex items-center justify-between px-2 border border-gray-800/10 rounded bg-white">
                                <div
                                    className="tiptap "
                                    dangerouslySetInnerHTML={{
                                        __html:
                                            productDetails.description || "",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </ProductEditContainer>
                <ProductEditContainer title="Media" id="edit-media">
                    <div className="space-y-3">
                        {/* product thumbnail */}
                        <div className="bg-gray-600/10 md:px-2 px-1 md:py-3 py-1 rounded">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-semibold mb-2">
                                    Product Thumbnail
                                </h3>
                                <PopupDialog title="Update Product thumbnail.">
                                    <ProductThumbnailForm
                                        content={productDetails.thumbnail}
                                        productId={productDetails.id}
                                        productName={productDetails.name}
                                    />
                                </PopupDialog>
                            </div>
                            <figure className="w-32 h-32 mx-auto">
                                <Image
                                    src={
                                        productDetails.thumbnail ||
                                        "/assets/logo/no-image.jpg"
                                    }
                                    alt={productDetails.name}
                                    width={100}
                                    height={100}
                                    className="w-auto h-auto rounded"
                                />
                            </figure>
                        </div>

                        <div className="bg-gray-600/10 md:px-2 px-1 md:py-3 py-1 rounded ">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-semibold mb-2">
                                    Product Images
                                </h3>
                                <PopupDialog
                                    title="Update Product Images."
                                    withFit={true}
                                >
                                    <ProductImagesForm
                                        content={JSON.stringify(
                                            productDetails.images.map(
                                                (item) => ({
                                                    id: item.id,
                                                    imgUrl: item.imgUrl,
                                                })
                                            )
                                        )}
                                        productName={productDetails.name}
                                        productId={productDetails.id}
                                    />
                                </PopupDialog>
                            </div>
                            <div className="flex justify-center items-center gap-1">
                                {productDetails.images.length > 0 ? (
                                    productDetails.images.map((image, inx) => (
                                        <figure
                                            key={image.id}
                                            className="w-32 h-32"
                                        >
                                            <Image
                                                src={image.imgUrl}
                                                alt={
                                                    productDetails.name +
                                                    (inx + 1)
                                                }
                                                width={100}
                                                height={100}
                                                className="w-auto h-auto rounded"
                                            />
                                        </figure>
                                    ))
                                ) : (
                                    <figure className="w-32 h-32 flex gap-1 items-center ">
                                        <Image
                                            src={"/assets/logo/no-image.jpg"}
                                            alt={productDetails.name}
                                            width={100}
                                            height={100}
                                            className="w-auto h-auto rounded"
                                        />
                                    </figure>
                                )}
                            </div>
                        </div>
                    </div>
                </ProductEditContainer>
            </div>

            <div className="md:col-span-1 ">
                <ProductEditContainer title="Price Section" id="product-price">
                    <div className="bg-gray-600/10 md:px-2 px-1 md:py-3 py-1 rounded">
                        <div className="flex items-center gap-2 ">
                            <h3 className="text-lg font-semibold mb-2">
                                Product Price{" "}
                            </h3>
                            <PopupDialog
                                title="Update Product price."
                                withFit={true}
                            >
                                <ProductPriceVariantForm
                                    productId={productDetails.id}
                                    productUnit={productDetails.unit}
                                    content={JSON.stringify({
                                        price: productDetails.price,
                                        variants: productDetails.variants,
                                    })}
                                    productCurrency={productDetails.currency}
                                />
                            </PopupDialog>
                        </div>

                        <ul className=" px-2 border border-gray-800/10 rounded bg-white">
                            {productDetails.price &&
                                productDetails.price.length > 0 &&
                                productDetails.price.map((price) => {
                                    const title =
                                        productDetails.variants.find(
                                            (variant) =>
                                                variant.id === price.variantId
                                        )?.title || "Default";
                                    return (
                                        <li
                                            key={price.variantId}
                                            className="flex items-center justify-around py-2 border-b border-neutral-700/10  last:border-0 p-2 px-4"
                                        >
                                            <p className="text-sm font-semibold capitalize">
                                                {title}:
                                            </p>
                                            -
                                            <span className="w-24">
                                                {price.price}
                                            </span>
                                            -
                                            <span>
                                                {price.select ? (
                                                    <OnCheckmark color="green" />
                                                ) : (
                                                    <InfoIcon color="green" />
                                                )}
                                            </span>
                                        </li>
                                    );
                                })}
                        </ul>
                    </div>
                    <div className="bg-gray-600/10 md:px-2 px-1 md:py-3 py-1 rounded">
                        {/* Delivery cost */}
                        <div className="flex items-center gap-2 ">
                            <h3 className="text-lg font-semibold mb-2">
                                Delivery Cost{" "}
                            </h3>
                            <PopupDialog
                                title="Update product delivery Cost."
                                withFit={true}
                            >
                                <ProductShippingCostForm
                                    currency={productDetails.currency}
                                    productId={productDetails.id}
                                    content={JSON.stringify(
                                        productDetails.shippingCost
                                    )}
                                />
                            </PopupDialog>
                        </div>
                        {/* shipping cost show */}
                        <ul className=" px-2 border border-gray-800/10 rounded bg-white">
                            {productDetails.shippingCost &&
                                productDetails.shippingCost.length > 0 &&
                                productDetails.shippingCost.map((sCost) => {
                                    return (
                                        <li
                                            key={sCost.shippingId}
                                            className="flex items-center justify-around py-2 border-b border-neutral-700/10  last:border-0 p-2 px-4"
                                        >
                                            <div>
                                                <h4 className="font-medium">
                                                    {sCost.title}
                                                </h4>
                                                <p>{sCost.shortDescription}</p>
                                            </div>
                                            <span>-</span>
                                            <p>{sCost.price.toFixed(2)}</p>
                                        </li>
                                    );
                                })}
                        </ul>
                    </div>
                </ProductEditContainer>

                <ProductEditContainer
                    title="Other information"
                    id="other-information"
                >
                    {/* product category */}
                    <div className=" bg-gray-600/10 md:px-2 px-1 md:py-3 py-1 rounded">
                        <h3 className="text-lg font-semibold mb-2">Category</h3>
                        <div className="flex items-center justify-between px-2 border border-gray-800/10 rounded bg-white">
                            <p className="capitalize">
                                {productDetails.category.name.toLocaleLowerCase()}
                            </p>{" "}
                            <PopupDialog title="Update Product Category.">
                                <ProductCategoryForm
                                    content={productDetails.category._id}
                                    productId={productDetails.id}
                                />
                            </PopupDialog>
                        </div>
                    </div>

                    <div className="bg-gray-600/10 md:px-2 px-1 md:py-3 py-1 rounded">
                        <h3 className="text-xl font-semibold mb-2">
                            Short Description
                        </h3>
                        <div className="flex items-center justify-between px-2 border border-gray-800/10 rounded bg-white">
                            <p>{productDetails.shortDescription}</p>{" "}
                            <PopupDialog title="Update Short Description.">
                                <ProductShortDescriptionForm
                                    content={
                                        productDetails.shortDescription || ""
                                    }
                                    productId={productDetails.id}
                                />
                            </PopupDialog>
                        </div>
                    </div>

                    <div className="bg-gray-600/10 md:px-2 px-1 md:py-3 py-1 rounded">
                        <div className="flex items-center gap-2">
                            <h3 className="text-xl font-semibold mb-2">Tags</h3>
                            <PopupDialog title="Update Short Description.">
                                <ProductTagsForm
                                    content={
                                        productDetails.tags &&
                                        Array.isArray(productDetails.tags) &&
                                        productDetails.tags.length > 0
                                            ? JSON.stringify(
                                                  productDetails.tags
                                              )
                                            : ""
                                    }
                                    productId={productDetails.id}
                                />
                            </PopupDialog>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {productDetails.tags &&
                                productDetails.tags?.length > 0 &&
                                productDetails.tags.map((tag) => (
                                    <p
                                        key={tag}
                                        className="bg-white p-2.5 rounded-md"
                                    >
                                        {tag}
                                    </p>
                                ))}
                        </div>
                    </div>
                </ProductEditContainer>
            </div>
        </div>
    );
}
