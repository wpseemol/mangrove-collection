import * as motion from "motion/react-client";

export default function AddProductPage() {
     return (
          <>
               <motion.h1
                    className="text-4xl font-bold mb-4"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
               >
                    Add product
               </motion.h1>
          </>
     );
}
