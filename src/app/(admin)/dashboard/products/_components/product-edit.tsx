"use client";

import { Button } from "@/components/ui/button";
import { ProductManageType } from "@/lib/actions/products/get-product-manage";
import { CellContext } from "@tanstack/react-table";

export default function ProductEdit({
     info,
}: {
     info: CellContext<ProductManageType>;
}) {
     async function handleEdit() {
          const productId = info.row.original;
          console.log("Editing product with ID:", productId);
          // Here you would typically call an API to edit the product
          // await editProduct(productId);
     }
     return (
          <Button
               onClick={handleEdit}
               variant="outline"
               size="sm"
               className="border-gray-300 hover:text-gray-600 hover:border-gray-600"
          >
               Edit
          </Button>
     );
}
