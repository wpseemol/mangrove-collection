import * as motion from "motion/react-client";
import Link from "next/link";
export default function OrderPages() {
     return (
          <div className="flex flex-col items-center justify-center p-6 py-6">
               <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl"
               >
                    <h1 className="text-2xl font-bold mb-4 text-gray-800">
                         Your Orders
                    </h1>
                    <p className="text-gray-600 mb-6">
                         You have no orders yet. Start shopping to see your
                         orders here!
                    </p>
                    <div className="flex justify-center">
                         <button className=" bg-blue-600 text-white rounded hover:bg-blue-700 transition overflow-hidden">
                              <Link
                                   href="/products"
                                   className="w-full inline-block border px-6 py-2 rounded"
                              >
                                   Shop Now
                              </Link>
                         </button>
                    </div>
               </motion.div>
          </div>
     );
}
