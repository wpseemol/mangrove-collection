import * as motion from "motion/react-client";
import Link from "next/link";

export default function EmptyProducts() {
     return (
          <motion.div
               className="flex flex-col items-center justify-center py-16"
               initial={{ opacity: 0, y: 40 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, ease: "easeOut" }}
          >
               <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={72}
                    height={72}
                    viewBox="0 0 72 72"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="mb-6"
                    fill="none"
               >
                    <rect
                         x="12"
                         y="24"
                         width="48"
                         height="32"
                         rx="6"
                         fill="#E0E7EF"
                    />
                    <rect
                         x="20"
                         y="32"
                         width="32"
                         height="16"
                         rx="3"
                         fill="#F3F6FA"
                    />
                    <path
                         d="M24 40h8m8 0h8"
                         stroke="#A0AEC0"
                         strokeWidth={2}
                         strokeLinecap="round"
                    />
                    <circle cx="36" cy="48" r="2" fill="#A0AEC0" />
                    <rect
                         x="16"
                         y="16"
                         width="40"
                         height="8"
                         rx="4"
                         fill="#B4C6E7"
                         opacity={0.5}
                    />
               </motion.svg>
               <h2 className="text-xl font-semibold text-gray-700 mb-2">
                    Your order is empty
               </h2>
               <p className="text-gray-500 mb-6 text-center max-w-xs">
                    Looks like you haven&apos;t any Order completed now.
               </p>
               <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-6 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700 transition"
               >
                    <Link href="/products">Browse Products</Link>
               </motion.button>
          </motion.div>
     );
}
