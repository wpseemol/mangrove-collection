"use client";

import { Button } from "@/components/ui/button";
import { deleteProduct } from "@/lib/actions/product";
import { ProductManageType } from "@/lib/actions/products/get-product-manage";
import { Row } from "@tanstack/react-table";
import { usePathname } from "next/navigation";
import Swal from "sweetalert2";

export default function ProductDelete({
     row,
}: {
     row: Row<ProductManageType>;
}) {
     const pathName = usePathname();

     async function handleDelete() {
          try {
               const result = await Swal.fire({
                    title: `Are you sure?`,
                    text: `Do you really want to delete the product "${row.original.name}"?`,
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Yes, delete it!",
               });

               if (result.isConfirmed) {
                    const loadingSwal = Swal.fire({
                         title: "Deleting...",
                         text: "Please wait while the product is being deleted.",
                         allowOutsideClick: false,
                         didOpen: () => {
                              Swal.showLoading();
                         },
                    });

                    await deleteProduct({
                         productId: row.original.id,
                         images: JSON.stringify(row.original.images),
                         pathName,
                    });

                    Swal.close(); // Close the loading Swal
                    await Swal.fire({
                         title: "Deleted!",
                         text: `The product "${row.original.name}" was successfully deleted.`,
                         icon: "success",
                         timer: 1500,
                    });
               }
          } catch {
               Swal.close(); // Ensure the loading Swal is closed in case of an error
               await Swal.fire({
                    title: "Error!",
                    text: "An error occurred while deleting the product. Please try again.",
                    icon: "error",
               });
          }
     }

     return (
          <Button
               onClick={handleDelete}
               type="button"
               aria-label="Delete Product"
               variant="outline"
               size="sm"
               className="border-red-300 text-red-400 hover:text-red-500 hover:border-red-600"
          >
               Delete
          </Button>
     );
}
