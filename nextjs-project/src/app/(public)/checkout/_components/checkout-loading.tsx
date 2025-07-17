import { motion } from "framer-motion";

export default function CheckoutLoading() {
     return (
          <div className="flex flex-col justify-center items-center min-h-[400px] gap-4">
               {/* Spinner Container */}
               <motion.div
                    animate={{
                         rotate: 360,
                         transition: {
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                         },
                    }}
                    className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-primary"
                    aria-label="Loading"
               />

               {/* Pulsing Text */}
               <motion.p
                    animate={{
                         opacity: [0.5, 1],
                         scale: [0.95, 1],
                    }}
                    transition={{
                         duration: 1,
                         repeat: Infinity,
                         repeatType: "reverse",
                         ease: "easeInOut",
                    }}
                    className="text-gray-600 font-medium"
               >
                    Processing Your Order...
               </motion.p>
          </div>
     );
}
