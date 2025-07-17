import { getCategory } from "@/lib/actions/category";
import * as motion from "motion/react-client";
import AddProduct from "./_components/add-product";

export default async function AddProductPage() {
     const allCategory = await getCategory();

     return (
          <>
               <motion.h1
                    className="md:text-2xl text-xl font-semibold md:m-5 m-2"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
               >
                    Add product
               </motion.h1>

               <AddProduct allCategory={JSON.stringify(allCategory)} />
          </>
     );
}
