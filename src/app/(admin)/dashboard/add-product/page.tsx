import { auth } from "@/auth";
import { getCategory } from "@/lib/actions/category";
import * as motion from "motion/react-client";
import { notFound } from "next/navigation";
import AddProduct from "./_components/add-product";

export default async function AddProductPage() {
     const allCategory = await getCategory();
     const session = await auth();

     if (!session || session?.user.role !== "admin") {
          notFound();
          return;
     }
     return (
          <>
               <motion.h1
                    className="text-4xl font-bold mb-4"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
               >
                    Add product
               </motion.h1>

               <AddProduct
                    allCategory={JSON.stringify(allCategory)}
                    user={JSON.stringify(session.user)}
               />
          </>
     );
}
