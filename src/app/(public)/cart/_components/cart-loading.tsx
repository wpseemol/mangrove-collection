"use client";
import { motion } from "framer-motion";

const skeletonVariants = {
     initial: { opacity: 0.5 },
     animate: { opacity: 1 },
};

export default function CartLoading() {
     return (
          <div className="w-full space-y-6">
               {[...Array(3)].map((_, index) => (
                    <motion.div
                         key={index}
                         className="flex gap-4 p-4 border border-neutral-700/10 rounded-lg"
                         initial="initial"
                         animate="animate"
                         variants={skeletonVariants}
                         transition={{
                              repeat: Infinity,
                              repeatType: "reverse",
                              duration: 1,
                              delay: index * 0.2,
                         }}
                    >
                         {/* Image placeholder */}
                         <div className="w-24 h-24 bg-gray-200 rounded-lg" />

                         <div className="flex-1 space-y-3">
                              {/* Title placeholder */}
                              <div className="h-4 bg-gray-200 rounded w-3/4" />

                              {/* Price placeholder */}
                              <div className="h-4 bg-gray-200 rounded w-1/4" />

                              {/* Quantity selector placeholder */}
                              <div className="flex items-center gap-4">
                                   <div className="w-8 h-8 bg-gray-200 rounded" />
                                   <div className="w-4 h-4 bg-gray-200 rounded" />
                                   <div className="w-8 h-8 bg-gray-200 rounded" />
                              </div>
                         </div>

                         {/* Delete button placeholder */}
                         <div className="w-8 h-8 bg-gray-200 rounded-full" />
                    </motion.div>
               ))}
          </div>
     );
}
