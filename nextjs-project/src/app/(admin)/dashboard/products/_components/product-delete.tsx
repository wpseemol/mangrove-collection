"use client";

import { Button } from "@/components/ui/button";
import {
     Dialog,
     DialogClose,
     DialogContent,
     DialogDescription,
     DialogFooter,
     DialogHeader,
     DialogTitle,
     DialogTrigger,
} from "@/components/ui/dialog";
import { deleteProduct } from "@/lib/actions/product";
import { ProductManageType } from "@/lib/actions/products/get-product-manage";
import { Row } from "@tanstack/react-table";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function ProductDelete({
     row,
}: {
     row: Row<ProductManageType>;
}) {
     const [isOpen, setIsOpen] = useState(false);
     const [isDeleted, setIsDeleted] = useState<boolean>(false);
     const [loading, setLoading] = useState<boolean>(false);

     const pathName = usePathname();

     async function handleDelete() {
          setLoading(true);
          const productId = row.original.id;

          const productAllImage = row.original.images;
          try {
               await deleteProduct(
                    productId,
                    JSON.stringify(productAllImage),
                    pathName
               );
               setIsDeleted(true);
          } catch (error) {
               console.error("Error deleting product:", error);
               setIsDeleted(false);
          } finally {
               setLoading(false);
          }

          setTimeout(() => {
               setIsOpen(false);
               setIsDeleted(false);
          }, 1500);
     }

     return (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
               <DialogTrigger asChild>
                    <Button
                         type="button"
                         aria-label="Delete Product"
                         variant="outline"
                         size="sm"
                         className="border-red-300 text-red-400 hover:text-red-500 hover:border-red-600"
                    >
                         Delete
                    </Button>
               </DialogTrigger>
               <DialogContent
                    className={`sm:max-w-[425px] bg-gray-100 border-transparent shadow-2xl`}
               >
                    <DialogHeader>
                         <DialogTitle className="text-red-500">
                              {`Delete Product: ${row.original.name}`}
                         </DialogTitle>
                         <DialogDescription>
                              This action cannot be undone.Product data will be
                              permanently removed.
                         </DialogDescription>
                    </DialogHeader>
                    {loading ? (
                         <div className="flex justify-center items-center py-4">
                              <p className="text-gray-500">Deleting...</p>
                         </div>
                    ) : isDeleted ? (
                         <div className="text-green-500 py-4">
                              <p className="font-medium">
                                   Product deleted successfully.
                              </p>
                         </div>
                    ) : (
                         <div className="text-gray-700 py-4">
                              <p className="font-medium">
                                   You are about to delete this product:
                              </p>
                              <p className="mt-2">
                                   • Name: {row.original.name}
                              </p>
                              {row.original.id && (
                                   <p>• ID: {row.original.id}</p>
                              )}
                         </div>
                    )}

                    <DialogFooter className="mt-2">
                         <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                         </DialogClose>
                         <Button
                              onClick={handleDelete}
                              variant="destructive"
                              className="bg-red-500 hover:bg-red-600 text-white"
                         >
                              Confirm Delete
                         </Button>
                    </DialogFooter>
               </DialogContent>
          </Dialog>
     );
}
