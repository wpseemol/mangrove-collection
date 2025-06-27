"use client";

import {
     AlertDialog,
     AlertDialogAction,
     AlertDialogCancel,
     AlertDialogContent,
     AlertDialogDescription,
     AlertDialogFooter,
     AlertDialogHeader,
     AlertDialogTitle,
     AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import { ProductManageType } from "@/lib/actions/products/get-product-manage";
import { Row } from "@tanstack/react-table";

export default function ProductEdit({ row }: { row: Row<ProductManageType> }) {
     async function handleEdit() {
          const productId = row.original.id;
          console.log("Editing product with ID:", productId);
          // Here you would typically call an API to edit the product
          // await editProduct(productId);
     }
     return (
          <AlertDialog>
               <AlertDialogTrigger asChild>
                    <Button
                         onClick={handleEdit}
                         variant="outline"
                         size="sm"
                         className="border-gray-300 hover:text-gray-600 hover:border-gray-600"
                    >
                         Edit
                    </Button>
               </AlertDialogTrigger>
               <AlertDialogContent className=" bg-gray-200 dark:bg-gray-800/90 border-gray-200 dark:border-gray-700">
                    <AlertDialogHeader>
                         <AlertDialogTitle>edit product</AlertDialogTitle>
                         <AlertDialogDescription>
                              Coming soon! This feature is under development.
                         </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                         <AlertDialogCancel>Cancel</AlertDialogCancel>
                         <AlertDialogAction className="text-white">
                              Continue
                         </AlertDialogAction>
                    </AlertDialogFooter>
               </AlertDialogContent>
          </AlertDialog>
     );
}
