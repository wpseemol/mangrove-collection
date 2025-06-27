"use client";

import { Button } from "@/components/ui/button";
import { ProductManageType } from "@/lib/actions/products/get-product-manage";
import { CellContext } from "@tanstack/react-table";

export default function ProductDelete({
     info,
}: {
     info: CellContext<ProductManageType>;
}) {
     async function handleDelete() {
          const productId = info.row.original.id;
          console.log("Deleting product with ID:", productId);
          // Here you would typically call an API to delete the product
          // await deleteProduct(productId);
          console.log("ProductDelete", info.row.original);
     }

     return (
          <Button
               onClick={handleDelete}
               variant="outline"
               size="sm"
               className="border-red-300 text-red-400 hover:text-red-600 hover:border-red-600"
          >
               Delete
          </Button>
     );
}
