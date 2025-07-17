import * as motion from "motion/react-client";
import Link from "next/link";

export default function OfferPage() {
     return (
          <main className="min-h-[calc(100vh-20rem)] flex justify-center items-center flex-col">
               <div className=" text-center">
                    <motion.h2
                         initial={{ opacity: 0, scale: 0 }}
                         animate={{ opacity: 1, scale: 1 }}
                         transition={{ duration: 0.6, ease: "easeInOut" }}
                         className="text-2xl font-semibold text-gray-800 mb-2"
                    >
                         No Offers Running
                    </motion.h2>
                    <motion.p
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 1 }}
                         transition={{ duration: 0.6, ease: "easeOut" }}
                         className="text-gray-500"
                    >
                         Please check back later for exciting offers!
                    </motion.p>
                    <motion.button
                         initial={{ opacity: 0, y: 40 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{
                              duration: 0.5,
                              delay: 0.7,
                              ease: "easeOut",
                         }}
                         className="mt-6 px-6 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 focus:outline-none"
                    >
                         <Link href="/">Go to Home</Link>
                    </motion.button>
               </div>
          </main>
     );
}
