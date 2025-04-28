import ProductCard from "@/components/product-card";
import { getPopularProducts } from "@/lib/server/products";
import * as motion from "motion/react-client";
import HomeTitle from "./home-title";

export default async function PopularProductSection() {
     const popularProducts = await getPopularProducts();

     return (
          <section className="container mx-auto md:pb-10 pb-5 px-2 md:px-0">
               <HomeTitle>
                    <samp className="uppercase">POPULAR PRODUCTS🔥</samp>
               </HomeTitle>

               {popularProducts.length > 0 && (
                    <motion.div
                         variants={containerVariants}
                         initial="hidden"
                         whileInView="visible"
                         viewport={{ once: true, margin: "0px 0px -100px 0px" }}
                         className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 md:gap-3 gap-2"
                    >
                         {popularProducts.map((product) => (
                              <motion.div
                                   key={product.id}
                                   variants={itemVariants}
                                   viewport={{ once: true }}
                              >
                                   <ProductCard details={product} />
                              </motion.div>
                         ))}
                    </motion.div>
               )}
          </section>
     );
}

const containerVariants = {
     hidden: { opacity: 0 },
     visible: {
          opacity: 1,
          transition: {
               staggerChildren: 0.1,
               delayChildren: 0.2,
          },
     },
};

const itemVariants = {
     hidden: { opacity: 0, y: 20 },
     visible: {
          opacity: 1,
          y: 0,
          transition: { type: "spring", stiffness: 120 },
     },
};
