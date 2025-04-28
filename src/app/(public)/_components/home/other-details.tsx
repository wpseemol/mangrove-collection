import * as motion from "motion/react-client";
import Link from "next/link";

export default function OtherDetails() {
     return (
          <motion.section
               className="container mx-auto mb-10 px-4 md:px-0"
               id="about"
               initial={{ opacity: 0, y: 50 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.6 }}
          >
               <motion.div
                    className="mb-5"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
               >
                    <h2 className="text-3xl font-bold">
                         <span className="text-primary-foreground">
                              Discover Authentic{" "}
                              <Link
                                   href="https://en.wikipedia.org/wiki/Sundarbans"
                                   className="underline"
                              >
                                   Sundarbans
                              </Link>{" "}
                              Treasures at{" "}
                              <Link href="/" className="underline">
                                   Mangrove Collection
                              </Link>
                         </span>
                    </h2>
               </motion.div>

               <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
               >
                    <p className="text-base leading-7">
                         Welcome to Mangrove Collection — your trusted
                         destination for authentic natural products from the
                         heart of the{" "}
                         <Link
                              href="https://en.wikipedia.org/wiki/Sundarbans"
                              className="underline"
                         >
                              Sundarbans
                         </Link>
                         . We believe in the power of nature and bring you
                         premium items like raw honey, fresh fish, and organic
                         resources sourced responsibly from the mangrove
                         forests.
                    </p>
               </motion.div>

               <motion.div
                    className="my-5"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
               >
                    <h2 className="text-3xl font-bold">
                         <span className="text-primary-foreground">
                              Why Choose{" "}
                              <Link href="/" className="underline">
                                   Mangrove Collection
                              </Link>
                              ?
                         </span>
                    </h2>
               </motion.div>

               <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 }}
               >
                    <p className="text-base leading-7">
                         In today&apos;s world, choosing natural, sustainable
                         products is more important than ever. At Mangrove
                         Collection, we are committed to offering you the
                         highest quality goods, sourced directly from the{" "}
                         <Link
                              href="https://en.wikipedia.org/wiki/Sundarbans"
                              className="underline"
                         >
                              Sundarbans
                         </Link>
                         , supporting local communities, and preserving the
                         beauty of nature. Whether you&apos;re looking for pure
                         honey, wild-caught fish, or unique Sundarbans products,
                         we ensure authenticity and excellence in every item.
                    </p>
               </motion.div>

               <motion.div
                    className="my-5"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.0 }}
               >
                    <h2 className="text-3xl font-bold">
                         <span className="text-primary-foreground">
                              Visit Us Online or In-Store
                         </span>
                    </h2>
               </motion.div>

               <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.2 }}
               >
                    <p className="text-base leading-7">
                         Whether you prefer shopping from the comfort of your
                         home or visiting one of our physical outlets in Dhaka,{" "}
                         <Link href="/" className="underline">
                              Mangrove Collection
                         </Link>{" "}
                         is here to serve you. Browse our wide range of
                         Sundarbans treasures online and experience the richness
                         of nature, delivered straight to your doorstep.
                    </p>
               </motion.div>
          </motion.section>
     );
}
