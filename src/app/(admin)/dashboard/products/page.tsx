import { getProductManage } from "@/lib/actions/products/get-product-manage";
import * as motion from "framer-motion/client";
import ProductsManageTable from "./_components/products-manage-table";

export default async function ProductPage() {
     const response = await getProductManage();

     if (!response.success) {
          return (
               <main className="p-4">
                    <motion.h1
                         className="text-2xl font-bold mb-2"
                         initial={{ opacity: 0, x: 20 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ duration: 0.5 }}
                    >
                         Products
                    </motion.h1>
                    <motion.p
                         className="text-red-500"
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ duration: 0.5 }}
                    >
                         {response.message}
                    </motion.p>
               </main>
          );
     }

     return (
          <main className="p-4">
               <motion.h1
                    className="text-2xl font-bold mb-2"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
               >
                    Products
               </motion.h1>
               <ProductsManageTable data={response.products} />
          </main>
     );
}
