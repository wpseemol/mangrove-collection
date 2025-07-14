import { getProductForEdit } from "@/lib/actions/product";
import * as motion from "motion/react-client";
import { Toaster } from "sonner";
import ProductViewForEdit from "./_components/product-view-for-edit";

export default async function ProductEditPage({
     params,
}: {
     params: Promise<{ productSlug: string }>;
}) {
     const slug = (await params).productSlug;

     const response = await getProductForEdit(slug);

     return (
          <main className="">
               <motion.h1
                    className="md:text-2xl text-xl font-semibold md:m-5 m-2 flex items-center gap-2"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
               >
                    <svg
                         xmlns="http://www.w3.org/2000/svg"
                         className="w-6 h-6 text-gray-500"
                         fill="none"
                         viewBox="0 0 24 24"
                         stroke="currentColor"
                         strokeWidth={2}
                    >
                         <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 20h9"
                         />
                         <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16.5 3.5a2.121 2.121 0 113 3L7 19.5 3 21l1.5-4L16.5 3.5z"
                         />
                    </svg>
                    Edit product
               </motion.h1>
               {response.product && (
                    <ProductViewForEdit stringDetails={response.product} />
               )}
               <Toaster position="top-center" richColors closeButton />
          </main>
     );
}
