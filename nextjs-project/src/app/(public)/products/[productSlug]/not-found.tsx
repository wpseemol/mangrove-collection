"use client";
import { AnimatePresence, motion } from "framer-motion";

export default function ProductNotFount() {
     return (
          <div className="xl:min-h-[calc(100vh-22rem)] flex justify-center items-center">
               <AnimatePresence>
                    <motion.div
                         key="empty-products"
                         initial="hidden"
                         animate="visible"
                         exit="exit"
                         variants={pageVariants}
                         className="flex flex-col items-center justify-center text-center p-8"
                    >
                         <motion.div
                              className="mb-6 text-6xl"
                              animate={{
                                   rotate: [0, 15, -15, 0],
                                   transition: {
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                   },
                              }}
                         >
                              📦
                         </motion.div>

                         <motion.h2 className="mb-2 text-2xl font-bold text-gray-800">
                              No Products Found
                         </motion.h2>
                    </motion.div>
               </AnimatePresence>
          </div>
     );
}

const pageVariants = {
     hidden: { opacity: 0, y: 20 },
     visible: { opacity: 1, y: 0 },
     exit: { opacity: 0, y: -20 },
};
