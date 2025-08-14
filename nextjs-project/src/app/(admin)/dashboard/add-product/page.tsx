import { getCategory } from "@/lib/actions/category";
import * as motion from "motion/react-client";
import AddProduct from "./_components/add-product";

export default async function AddProductPage() {
     const allCategory = await getCategory();

     return (
          <motion.section
               className="sm:p-4 p-2"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5 }}
          >
               <motion.h1
                    className="md:text-2xl text-xl font-semibold mb-3 -mt-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
               >
                    Add product
               </motion.h1>

               <AddProduct allCategory={JSON.stringify(allCategory)} />
          </motion.section>
     );
}
