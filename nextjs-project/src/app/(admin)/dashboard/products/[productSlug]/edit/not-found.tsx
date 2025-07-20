import * as motion from "motion/react-client";
import Link from "next/link";

export default function EditProductNotFound() {
     return (
          <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center ">
               <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.5 }}
                    className="  p-8 text-center"
               >
                    {/* Animated 404 Illustration */}
                    <motion.div
                         animate={{
                              rotate: [0, 10, -10, 0], // Gentle sway
                         }}
                         transition={{
                              repeat: Infinity,
                              repeatType: "reverse",
                              duration: 2,
                         }}
                         className="mb-6 mx-auto w-fit"
                    >
                         <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="120"
                              height="120"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#ef4444"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                         >
                              <circle cx="12" cy="12" r="10" />
                              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                              <motion.path
                                   animate={{ pathLength: [0, 1, 0] }}
                                   transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                   }}
                                   d="M16 16l-4-4m0 4l-4-4"
                              />
                         </svg>
                    </motion.div>

                    {/* Text Content */}
                    <motion.h1
                         initial={{ scale: 0.9 }}
                         animate={{ scale: 1 }}
                         transition={{ delay: 0.2 }}
                         className="text-3xl font-bold text-gray-800 mb-2"
                    >
                         Product Not Found
                    </motion.h1>
                    <motion.p
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         transition={{ delay: 0.4 }}
                         className="text-gray-600 mb-6"
                    >
                         Oops! The product you&apos;re trying to edit
                         doesn&apos;t exist.
                    </motion.p>

                    {/* Back Button */}
                    <motion.button
                         whileHover={{ scale: 1.05 }}
                         whileTap={{ scale: 0.95 }}
                         className="px-6 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors"
                    >
                         <Link href="/dashboard/products">Go Back</Link>
                    </motion.button>
               </motion.div>
          </div>
     );
}
