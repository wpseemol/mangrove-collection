import * as motion from "motion/react-client";
import { AddCategoryForm } from "./_components/add-category-form";

export default function AddCategoryPage() {
     return (
          <>
               <motion.h1
                    className="md:text-2xl text-xl font-semibold md:m-5 m-2"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
               >
                    Add Category
               </motion.h1>
               <AddCategoryForm />
          </>
     );
}
