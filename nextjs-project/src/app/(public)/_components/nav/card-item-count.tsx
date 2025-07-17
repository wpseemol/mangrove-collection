"use client";
import { useCart } from "@/hooks";
import { getCartData } from "@/lib/actions/cart";
import { useEffect } from "react";

export default function CartCount() {
     const { cart, setCart } = useCart();

     useEffect(() => {
          async function updateCart() {
               const data = await getCartData();

               if (data) {
                    setCart({
                         cartCount: data.carTotalItems,
                         cartProductIds: data.cartProductIds,
                    });
               }
          }

          updateCart();
     }, [setCart]);

     return <>{cart.cartCount ? <span>({cart.cartCount})</span> : ""}</>;
}
