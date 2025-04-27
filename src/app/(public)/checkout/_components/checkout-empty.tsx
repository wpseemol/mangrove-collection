import { motion } from "framer-motion";
import Link from "next/link";

export default function EmptyCheckout() {
     return (
          <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6 }}
               className="flex flex-col items-center justify-center gap-6 min-h-[400px] text-center p-8"
          >
               {/* Animated icon/emoji */}
               <motion.div
                    animate={{
                         scale: [1, 1.1, 1],
                         rotate: [0, -10, 10, 0],
                         x: [-5, 5, -5, 5, 0],
                    }}
                    transition={{
                         duration: 1.5,
                         repeat: Infinity,
                         repeatType: "reverse",
                    }}
                    className="text-5xl"
               >
                    🔍
               </motion.div>

               {/* Text animation */}
               <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl font-medium text-gray-600"
               >
                    No products found to buy.
               </motion.p>

               {/* Optional button animation */}
               <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 mt-4 text-white bg-primary rounded-lg"
               >
                    <Link href="/" className="text-white">
                         Back to Shop
                    </Link>
               </motion.button>
          </motion.div>
     );
}
