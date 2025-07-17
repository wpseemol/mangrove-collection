"use client";

import { ProductDetailsType } from "@/types/mongoose/product";
import Image from "next/image";
import { PopupDialog } from "./popup-dialog";
import ProductEditContainer from "./product-edit-container";
import "./tiptap-style.css";
import ProductDescriptionForm from "./update-form/product-description-form";
import ProductNameForm from "./update-form/product-name-form";
import ProductSlugForm from "./update-form/product-slug-form";
import ProductThumbnailForm from "./update-form/product-thumbnail-form";
import ProductUnitForm from "./update-form/product-unit-form";

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
                              <div className="bg-gray-100 md:px-2 px-1 md:py-3 py-1 rounded">
                                   <h3 className="text-xl font-semibold">
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
                                   <div className="w-2/3 bg-gray-100 md:px-2 px-1 md:py-3 py-1 rounded">
                                        <h3 className="text-lg font-semibold">
                                             Slug
                                        </h3>
                                        <div className="flex items-center justify-between px-2 border border-gray-800/10 rounded bg-white">
                                             <p>{productDetails.slug}</p>{" "}
                                             <PopupDialog title="Update Product slug.">
                                                  <ProductSlugForm
                                                       content={
                                                            productDetails.slug
                                                       }
                                                       productId={
                                                            productDetails.id
                                                       }
                                                  />
                                             </PopupDialog>
                                        </div>
                                   </div>

                                   {/* product unit */}
                                   <div className="ml-2 w-1/3 bg-gray-100 md:px-2 px-1 md:py-3 py-1 rounded">
                                        <h3 className="text-lg font-semibold">
                                             Unit
                                        </h3>
                                        <div className="flex items-center justify-between px-2 border border-gray-800/10 rounded bg-white">
                                             <p className="uppercase">
                                                  {productDetails.unit}
                                             </p>{" "}
                                             <PopupDialog title="Update Product unit.">
                                                  <ProductUnitForm
                                                       content={
                                                            productDetails.unit
                                                       }
                                                       productId={
                                                            productDetails.id
                                                       }
                                                  />
                                             </PopupDialog>
                                        </div>
                                   </div>
                              </div>

                              <div className="bg-gray-100 md:px-2 px-1 md:py-3 py-1 rounded">
                                   {/* product description  */}
                                   <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-semibold">
                                             Product Description
                                        </h3>
                                        <PopupDialog
                                             title="Update Product Description."
                                             filedName="description"
                                        >
                                             <ProductDescriptionForm
                                                  content={
                                                       productDetails.description ||
                                                       ""
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
                                                       productDetails.description ||
                                                       "",
                                             }}
                                        />
                                   </div>
                              </div>
                         </div>
                    </ProductEditContainer>
                    <ProductEditContainer title="Media" id="edit-media">
                         <div className="space-y-3">
                              {/* product thumbnail */}
                              <div className="bg-gray-100 md:px-2 px-1 md:py-3 py-1 rounded">
                                   <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-semibold">
                                             Product Thumbnail
                                        </h3>
                                        <PopupDialog title="Update Product thumbnail.">
                                             <ProductThumbnailForm
                                                  content={
                                                       productDetails.thumbnail
                                                  }
                                                  productId={productDetails.id}
                                                  productName={
                                                       productDetails.name
                                                  }
                                             />
                                        </PopupDialog>
                                   </div>
                                   <figure className="w-32 h-32 mx-auto">
                                        <Image
                                             src={productDetails.thumbnail}
                                             alt={productDetails.name}
                                             width={100}
                                             height={100}
                                             className="w-auto h-auto rounded"
                                        />
                                   </figure>
                              </div>
                         </div>
                    </ProductEditContainer>
               </div>
          </div>
     );
}
