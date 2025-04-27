"use client";
import { Card, CardHeader } from "@/components/ui/card";

import { useCartProducts } from "@/hooks";
import { CartProductsType } from "@/lib/server/cart";
import { useEffect } from "react";
import CartEmpty from "./cart-empty";
import CartLoading from "./cart-loading";
import CartOrderSummary from "./cart-order-summary";
import { CartProductTable } from "./cart-product-table";
import MultiDeletedBtn from "./multi-deleted-btn";

export default function CartItems({ data }: { data: CartProductsType[] }) {
     const {
          loading,
          setLoading,
          cartProducts,
          setCartProducts,
          cartSelectedProducts,
     } = useCartProducts();

     useEffect(() => {
          setCartProducts(data);
          setLoading(false);
     }, [data, setCartProducts, setLoading]);

     return (
          <>
               <section
                    className={`md:my-10 my-5 w-full flex md:flex-row flex-col gap-2`}
               >
                    <Card
                         className={`${
                              cartSelectedProducts
                                   ? "md:w-[70%] w-full"
                                   : "w-full"
                         } p-5 duration-300 border-neutral-800/20`}
                    >
                         <CardHeader className="p-0 font-medium">
                              Shopping Cart
                         </CardHeader>

                         {loading ? (
                              <CartLoading />
                         ) : cartProducts ? (
                              <>
                                   <CartProductTable data={cartProducts} />
                                   <MultiDeletedBtn />
                              </>
                         ) : (
                              <CartEmpty />
                         )}
                    </Card>
                    {cartSelectedProducts && (
                         <section
                              className={`${
                                   cartSelectedProducts
                                        ? "md:w-[30%] w-full"
                                        : "w-full"
                              } duration-300 overflow-hidden h-fit sticky top-[6rem]`}
                         >
                              <CartOrderSummary />
                         </section>
                    )}
               </section>
          </>
     );
}
