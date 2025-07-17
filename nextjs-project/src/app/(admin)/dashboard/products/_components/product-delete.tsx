"use client";

import { Button } from "@/components/ui/button";
import { ProductManageType } from "@/lib/actions/products/get-product-manage";
import { Row } from "@tanstack/react-table";

export default function ProductDelete({
     row,
}: {
     row: Row<ProductManageType>;
}) {
     async function handleDelete() {
          const productId = row.original.id;
          const public_ids = row.original.public_ids;
          console.log("Deleting product with ID:", productId);
          console.log("Deleting product with ID:", public_ids);
          // Here you would typically call an API to delete the product
          // await deleteProduct(productId);
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
