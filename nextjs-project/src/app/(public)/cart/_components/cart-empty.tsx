"use client";
import CartIconSvg from "@/components/svg/cart-icon-svg";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";

export default function CartEmpty() {
     return (
          <section className="flex flex-col items-center justify-center my-10">
               <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                         type: "spring",
                         stiffness: 260,
                         damping: 20,
                    }}
               >
                    <CartIconSvg />
               </motion.div>

               <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="md:text-5xl text-3xl mb-5 text-center"
               >
                    Your cart is{" "}
                    <motion.span
                         initial={{ color: "#ffffff" }}
                         animate={{ color: "green" }} // Replace with your primary color
                         transition={{
                              duration: 2,
                              repeat: Infinity,
                              repeatType: "mirror",
                         }}
                         className="text-primary-foreground"
                    >
                         Empty
                    </motion.span>
               </motion.h2>

               <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mb-5 px-2 md:px-0 text-center"
               >
                    Must add items to the cart before you proceed to check out
               </motion.p>

               <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6 }}
               >
                    <Button
                         asChild
                         variant="default"
                         className="text-lg text-white"
                         size="lg"
                    >
                         <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                         >
                              <Link href="/">Return Home</Link>
                         </motion.div>
                    </Button>
               </motion.div>
          </section>
     );
}
