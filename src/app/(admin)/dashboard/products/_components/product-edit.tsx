"use client";

import { Button } from "@/components/ui/button";
import { getProductForEdit } from "@/lib/actions/product";

import {
     Dialog,
     DialogContent,
     DialogDescription,
     DialogHeader,
     DialogTitle,
     DialogTrigger,
} from "@/components/ui/dialog";
import { ProductManageType } from "@/lib/actions/products/get-product-manage";
import { ProductDetailsType } from "@/types/mongoose/product";
import { Row } from "@tanstack/react-table";
import { useState } from "react";
import EditProductForm from "./edit-form/edit-product-form";

export default function ProductEdit({ row }: { row: Row<ProductManageType> }) {
     const [editProduct, setEditProduct] = useState<EditProductType>({
          loading: false,
          product: null,
     });

     async function handleEdit() {
          setEditProduct((prev) => ({ ...prev, loading: true }));
          const productId = row.original.id;
          console.log("Editing product with ID:", productId);

          const response = await getProductForEdit(productId);
          setEditProduct((prev) => ({
               ...prev,
               loading: false,
               product: response.product
                    ? (JSON.parse(response.product) as ProductDetailsType)
                    : null,
          }));
     }
     return (
          <Dialog>
               <DialogTrigger asChild>
                    <Button
                         onClick={handleEdit}
                         variant="outline"
                         size="sm"
                         className="border-gray-300 hover:text-gray-600 hover:border-gray-600"
                    >
                         Edit
                    </Button>
               </DialogTrigger>
               <DialogContent className="bg-gray-200 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <DialogHeader>
                         <DialogTitle>Edit Product</DialogTitle>
                         {!editProduct.loading && (
                              <DialogDescription>
                                   Update the product information below. Click
                                   "Save changes" when finished.
                              </DialogDescription>
                         )}
                    </DialogHeader>

                    <>
                         {editProduct.loading ? (
                              <div className="flex items-center gap-2">
                                   <svg
                                        className="animate-spin h-5 w-5 text-gray-500"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                   >
                                        <circle
                                             className="opacity-25"
                                             cx="12"
                                             cy="12"
                                             r="10"
                                             stroke="currentColor"
                                             strokeWidth="4"
                                        ></circle>
                                        <path
                                             className="opacity-75"
                                             fill="currentColor"
                                             d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                        ></path>
                                   </svg>
                                   <span>Loading product details...</span>
                              </div>
                         ) : editProduct.product ? (
                              <EditProductForm
                                   productInfo={editProduct.product}
                              />
                         ) : (
                              <span className="text-red-500">
                                   Something went wrong. Please refresh try let.
                              </span>
                         )}
                    </>
               </DialogContent>
          </Dialog>
     );
}

type EditProductType = {
     loading: boolean;
     product: null | ProductDetailsType;
};
