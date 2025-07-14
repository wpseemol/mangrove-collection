"use client";

import { ProductDetailsType } from "@/types/mongoose/product";
import { PopupDialog } from "./popup-dialog";
import ProductEditContainer from "./product-edit-container";
import "./tiptap-style.css";
import ProductNameForm from "./update-form/product-name-form";

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
                              <div>
                                   <h3 className="text-xl font-semibold">
                                        Product Name
                                   </h3>
                                   <div className="flex items-center justify-between px-2 border border-gray-800/10 rounded">
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
                                   <div className="w-2/3">
                                        <h3 className="text-lg font-semibold">
                                             Slug
                                        </h3>
                                        <div className="flex items-center justify-between px-2 border border-gray-800/10 rounded">
                                             <p>{productDetails.slug}</p>{" "}
                                             <PopupDialog title="Update Product name.">
                                                  coming soon
                                             </PopupDialog>
                                        </div>
                                   </div>

                                   {/* product unit */}
                                   <div className="pl-2 w-1/3">
                                        <h3 className="text-lg font-semibold">
                                             Unit
                                        </h3>
                                        <div className="flex items-center justify-between px-2 border border-gray-800/10 rounded">
                                             <p>{productDetails.unit}</p>{" "}
                                             <PopupDialog title="Update Product name.">
                                                  coming soon
                                             </PopupDialog>
                                        </div>
                                   </div>
                              </div>

                              <div>
                                   {/* product description  */}
                                   <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-semibold">
                                             Product Description
                                        </h3>
                                        <PopupDialog title="Update Product name.">
                                             coming soon
                                        </PopupDialog>
                                   </div>
                                   <div className="flex items-center justify-between px-2 border border-gray-800/10 rounded">
                                        <div
                                             className="tiptap"
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
               </div>
          </div>
     );
}
