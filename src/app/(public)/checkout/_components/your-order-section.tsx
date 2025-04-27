"use client";

import { CurrencyIcon } from "@/components/currency-icon";
import { usePurchase } from "@/hooks";
import {
     purchaseDataDelete,
     purchaseQuantityUpdate,
} from "@/lib/server/purchase";
import { PurchaseProductsType } from "@/types/purchase";
import debounce from "@/utils/debounce";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import EmptyCheckout from "./checkout-empty";
import CheckoutLoading from "./checkout-loading";

export default function YourOrderSection({
     data,
}: {
     data: PurchaseProductsType[] | null;
}) {
     const { setBuyProducts, setShippingCost } = usePurchase();
     const router = useRouter();

     const [loading, setLoading] = useState<boolean>(true);

     const [purcheseProducts, setPurcheseProducts] = useState<
          PurchaseProductsType[]
     >([]);

     const SHIPPING_CHARGE = 150; // Flat shipping charge

     const updateQuantity = (id: number | string, quantity: number) => {
          setPurcheseProducts((prevCart) =>
               prevCart.map((item) =>
                    item.id === id
                         ? { ...item, quantity: Math.max(1, quantity) }
                         : item
               )
          );
     };

     /**
      * remove frome Array
      * @param id
      */
     const removeItem = async (id: string) => {
          setPurcheseProducts((prev) => prev.filter((item) => item.id !== id));
          try {
               await purchaseDataDelete(id);
          } catch (error) {
               console.error("Purchus DELETE error:", error);
          }
     };

     /**
      * sub totla
      */

     const subtotal = purcheseProducts.reduce(
          (sum, item) => sum + item.price * (item.quantity ? item.quantity : 1),
          0
     );

     /**
      * Price totle
      */
     const total =
          subtotal + (purcheseProducts.length > 0 ? SHIPPING_CHARGE : 0);

     /**
      * set debounce function
      * @param id
      * @param quantity
      * update quantity onchange handler.
      */
     const debouncedUpdateQuantity = debounce(
          async (id: string, quantity: number) => {
               updateQuantity(id, quantity);

               try {
                    await purchaseQuantityUpdate(id, quantity);
               } catch (error) {
                    console.error("Purchus Patch error:", error);
               }
          },
          350
     );

     /**
      * get purchase ProductsData
      */
     useEffect(() => {
          setShippingCost(SHIPPING_CHARGE);

          if (data) {
               setPurcheseProducts(data);
          } else {
               setPurcheseProducts([]);
               Swal.fire({
                    icon: "info",
                    title: "You have not product sellection.",
                    showConfirmButton: false,
                    timer: 1500,
               }).then((result) => {
                    if (result.dismiss === Swal.DismissReason.timer) {
                         router.push("/");
                    }
               });
          }
          setLoading(false);
     }, [router, setShippingCost, setLoading]);

     /**
      * set buyProducts data set
      */
     useEffect(() => {
          const buyProducts = purcheseProducts.map((item) => ({
               productId: item.id,
               quantity: item.quantity,
               selectePriceId: item.selectePriceId,
          }));

          setBuyProducts(buyProducts);
     }, [purcheseProducts, setBuyProducts]);

     return (
          <div className="  md:py-8 py-4 pb-10 bg-white shadow-xl md:px-5 px-2 border-l border-green-300">
               <div className="h-fit sticky top-[6rem]">
                    <h3 className="text-xl font-semibold text-green-700 mb-2 text-center">
                         Your Order
                    </h3>
                    <hr />

                    {loading ? (
                         <CheckoutLoading />
                    ) : (
                         <AnimatePresence>
                              {purcheseProducts.length > 0 ? (
                                   purcheseProducts.map((product, index) => {
                                        currency = product.currency;

                                        return (
                                             <motion.div
                                                  key={product.id}
                                                  variants={itemVariants}
                                                  initial="hidden"
                                                  animate="visible"
                                                  exit="exit"
                                                  transition={{
                                                       delay: index * 0.1,
                                                  }}
                                                  layout
                                                  className="flex items-center justify-between border-b border-green-200 py-3 last:border-none"
                                             >
                                                  <div className="flex items-center gap-4">
                                                       <motion.div
                                                            whileHover={{
                                                                 scale: 1.05,
                                                            }}
                                                            className="rounded-md border border-green-400"
                                                       >
                                                            <Image
                                                                 src={
                                                                      product.thumbnail
                                                                 }
                                                                 alt={
                                                                      product.name
                                                                 }
                                                                 width={50}
                                                                 height={50}
                                                            />
                                                       </motion.div>

                                                       <div>
                                                            <Link
                                                                 href={`/products/${product.slug}`}
                                                            >
                                                                 <motion.p
                                                                      whileHover={{
                                                                           color: "#15803d",
                                                                      }}
                                                                      className="font-medium text-green-700"
                                                                 >
                                                                      {
                                                                           product.name
                                                                      }
                                                                 </motion.p>
                                                            </Link>
                                                            <p className="text-sm text-gray-600">
                                                                 {product.price}
                                                                 <CurrencyIcon
                                                                      currency={
                                                                           product.currency
                                                                      }
                                                                 />
                                                            </p>
                                                       </div>
                                                  </div>

                                                  <div className="flex items-center gap-2">
                                                       <motion.input
                                                            type="number"
                                                            min="1"
                                                            value={
                                                                 product.quantity
                                                            }
                                                            onChange={(e) => {
                                                                 const value =
                                                                      parseInt(
                                                                           e
                                                                                .target
                                                                                .value
                                                                      ) || 1;
                                                                 debouncedUpdateQuantity(
                                                                      product.id,
                                                                      value
                                                                 );
                                                            }}
                                                            whileFocus={{
                                                                 scale: 1.05,
                                                            }}
                                                            className="w-16 p-1 border rounded text-center border-green-400 focus:ring-green-500"
                                                       />

                                                       <motion.p
                                                            key={
                                                                 product.quantity
                                                            }
                                                            variants={
                                                                 QuantityVariants
                                                            }
                                                            animate="pulse"
                                                            className="font-medium text-green-700"
                                                       >
                                                            {product.price *
                                                                 product.quantity}
                                                            <CurrencyIcon
                                                                 currency={
                                                                      product.currency
                                                                 }
                                                            />
                                                       </motion.p>

                                                       <motion.button
                                                            onClick={() =>
                                                                 removeItem(
                                                                      product.id
                                                                 )
                                                            }
                                                            whileHover={{
                                                                 scale: 1.2,
                                                            }}
                                                            whileTap={{
                                                                 scale: 0.8,
                                                            }}
                                                            className="text-red-500 hover:text-red-700 transition duration-200"
                                                       >
                                                            ✕
                                                       </motion.button>
                                                  </div>
                                             </motion.div>
                                        );
                                   })
                              ) : (
                                   <EmptyCheckout />
                              )}

                              {/* Summary Section */}
                              {purcheseProducts.length > 0 ? (
                                   <>
                                        <div className="flex justify-end py-4">
                                             <p className="text-md text-gray-700 pr-5">
                                                  Shipping:{" "}
                                                  <span className="font-semibold text-green-700">
                                                       {purcheseProducts.length >
                                                       0
                                                            ? SHIPPING_CHARGE
                                                            : 0}
                                                       <CurrencyIcon
                                                            currency={currency}
                                                       />
                                                  </span>
                                             </p>
                                        </div>
                                        <div className=" border-t border-green-300 pt-4 text-right">
                                             <p className="text-md text-gray-700 pr-5">
                                                  Subtotal:{" "}
                                                  <span className="font-semibold text-green-700">
                                                       {subtotal}{" "}
                                                       <CurrencyIcon
                                                            currency={currency}
                                                       />
                                                  </span>
                                             </p>

                                             <p className="text-lg font-bold mt-2 text-green-800 pr-5">
                                                  Total:{" "}
                                                  <span className="text-green-600">
                                                       {total}
                                                       <CurrencyIcon
                                                            currency={currency}
                                                       />
                                                  </span>
                                             </p>
                                        </div>
                                   </>
                              ) : (
                                   ""
                              )}
                         </AnimatePresence>
                    )}
               </div>
          </div>
     );
}

let currency: string = "";

// Add animation variants
const itemVariants = {
     hidden: { opacity: 0, x: -50 },
     visible: { opacity: 1, x: 0 },
     exit: { opacity: 0, x: 50, transition: { duration: 0.2 } },
};

const QuantityVariants = {
     pulse: { scale: [1, 1.05, 1], transition: { duration: 0.3 } },
};
