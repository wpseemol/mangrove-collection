import * as motion from "motion/react-client";
import Link from "next/link";

export default function PointsPage() {
     return (
          <motion.div
               initial={{ opacity: 0, y: 40 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, ease: "easeOut" }}
               className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow-lg"
          >
               <h1 className="text-2xl font-bold mb-4 text-center">
                    My Points
               </h1>
               <div className="flex items-center justify-center mb-6">
                    <motion.div
                         initial={{ scale: 0 }}
                         animate={{ scale: 1 }}
                         transition={{
                              type: "spring",
                              stiffness: 200,
                              delay: 0.4,
                         }}
                         className="bg-yellow-400 text-white rounded-full w-24 h-24 flex items-center justify-center text-3xl font-bold shadow-lg"
                    >
                         0
                    </motion.div>
               </div>
               <p className="text-center text-gray-600 mb-8">
                    These are your selling points. Earn more by completing
                    sales!
               </p>
               <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="block mx-auto px-6 py-2 bg-blue-600 text-white rounded-md font-semibold shadow hover:bg-blue-700 transition"
               >
                    <Link href="/">Return Home</Link>
               </motion.button>
          </motion.div>
     );
}
