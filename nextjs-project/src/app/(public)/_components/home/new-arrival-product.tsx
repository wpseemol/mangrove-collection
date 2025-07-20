import ProductCard from "@/components/product-card";
import { getNewArrivalProducts } from "@/lib/actions/products";
import { Variants } from "framer-motion";
import * as motion from "motion/react-client";
import HomeTitle from "./home-title";

export default async function NewArrivalProduct() {
     const newArrivalProducts = await getNewArrivalProducts();

     return (
          <section className="container mx-auto md:pb-10 pb-5 px-2 md:px-0">
               <HomeTitle>
                    <motion.samp
                         className="uppercase"
                         initial={{ opacity: 0, x: -20 }}
                         whileInView={{ opacity: 1, x: 0 }}
                         viewport={{ once: true }}
                         transition={{ duration: 0.5 }}
                    >
                         TOP NEW ARRIVAL
                    </motion.samp>
               </HomeTitle>

               {newArrivalProducts.length > 0 && (
                    <motion.div
                         variants={sectionVariants}
                         initial="hidden"
                         whileInView="visible"
                         viewport={{ once: true, margin: "-100px" }}
                         className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3"
                    >
                         {newArrivalProducts.map((product) => (
                              <motion.div
                                   key={product.id}
                                   variants={itemVariants}
                                   className="flex justify-center"
                              >
                                   <ProductCard details={product} />
                              </motion.div>
                         ))}
                    </motion.div>
               )}
          </section>
     );
}

// Add these animation variants at the top of your file
const sectionVariants: Variants = {
     hidden: { opacity: 0 },
     visible: {
          opacity: 1,
          transition: {
               staggerChildren: 0.1,
               when: "beforeChildren",
          },
     },
};

const itemVariants: Variants = {
     hidden: { opacity: 0, y: 50 },
     visible: {
          opacity: 1,
          y: 0,
          transition: { type: "spring", stiffness: 120, damping: 15 },
     },
};
