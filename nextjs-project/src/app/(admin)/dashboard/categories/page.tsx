import { getCategoryForManage } from "@/lib/actions/category";
import * as motion from "framer-motion/client";
import { CategoryManageTable } from "./_components/category-manage-table";

export default async function CategoriesPage() {
     const response = await getCategoryForManage();

     return (
          <motion.section
               className="p-4"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5 }}
          >
               <motion.h1
                    className="text-2xl font-bold"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
               >
                    Categories
               </motion.h1>
               <CategoryManageTable data={response.categories} />
          </motion.section>
     );
}
