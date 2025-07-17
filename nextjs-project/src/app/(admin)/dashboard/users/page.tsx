import * as motion from "motion/react-client";

export default function UsersPage() {
     return (
          <motion.div
               className="flex flex-col items-center justify-center min-h-[60vh]"
               initial={{ opacity: 0, y: 40 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.7, ease: "easeOut" }}
          >
               <motion.h1
                    className="text-4xl font-bold mb-4"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
               >
                    Coming Soon
               </motion.h1>
               <motion.p
                    className="text-lg text-gray-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
               >
                    This page is under construction.
               </motion.p>
          </motion.div>
     );
}
