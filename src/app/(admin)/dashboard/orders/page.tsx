import * as motion from "framer-motion/client";
import { OrderManageTable } from "./_components/order-manage-table";

export default function OrderPage() {
     return (
          <main>
               <section className="p-4 pb-0">
                    <motion.div
                         className=""
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                         <h1 className="text-3xl font-bold text-gray-800 ">
                              Orders
                         </h1>
                         <p className="text-gray-600">
                              Manage your orders here.
                         </p>
                    </motion.div>
               </section>

               <section className="p-4 pt-0">
                    <OrderManageTable />
               </section>
          </main>
     );
}
