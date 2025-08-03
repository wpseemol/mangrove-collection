"use client";

import {
     categoryDeletedAction,
     CategoryForManage,
} from "@/lib/actions/category";
import { Row } from "@tanstack/react-table";
import { usePathname } from "next/navigation";
import { toast, Toaster } from "sonner";
import Swal from "sweetalert2";

export default function CategoryDeleted({
     row,
}: {
     row: Row<CategoryForManage>;
}) {
     const pathName = usePathname();

     async function handelDeleteCategory() {
          if (row.original.productCount > 0) {
               toast.warning(
                    "This category has associated products. Please delete the products first before deleting the category."
               );
               return;
          }

          try {
               const result = await Swal.fire({
                    title: `Are you sure?`,
                    text: `Do you really want to delete the category "${row.original.name}"?`,
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Yes, delete it!",
               });

               if (result.isConfirmed) {
                    Swal.fire({
                         title: "Deleting...",
                         text: "Please wait while the category is being deleted.",
                         allowOutsideClick: false,
                         didOpen: () => {
                              Swal.showLoading();
                         },
                    });

                    await categoryDeletedAction({
                         categoryId: row.original.id,
                         categoryImageUrl: row.original.imgUrl,
                         pathName,
                    });

                    Swal.close(); // Close the loading Swal
                    await Swal.fire({
                         title: "Deleted!",
                         text: `The category "${row.original.name}" was successfully deleted.`,
                         icon: "success",
                         timer: 1500,
                    });
               }
          } catch {
               Swal.close(); // Ensure the loading Swal is closed in case of an error
               await Swal.fire({
                    title: "Error!",
                    text: "An error occurred while deleting the category. Please try again.",
                    icon: "error",
               });
          }
     }

     return (
          <>
               <button
                    onClick={handelDeleteCategory}
                    className=" text-red-400 hover:text-red-500 hover:border-red-600"
               >
                    Deleted
               </button>
               <Toaster
                    position="top-center"
                    className="text-wrap"
                    richColors
                    closeButton
               />
          </>
     );
}
