import { getOrderData } from "@/lib/actions/order/getOrderData";
import * as motion from "framer-motion/client";
import { OrderManageTable } from "./_components/order-manage-table";

export default async function OrderPage() {
     const response = await getOrderData();

     if (!response.success) {
          return (
               <main className="p-4">
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
                              <p className="text-red-400">{response.message}</p>
                         </motion.div>
                    </section>
               </main>
          );
     }

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

               {response.orders && (
                    <section className="p-4 pt-0">
                         <OrderManageTable dataString={response.orders} />
                    </section>
               )}
          </main>
     );
}
