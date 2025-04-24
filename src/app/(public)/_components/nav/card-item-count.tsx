"use client";
import { useCart } from "@/hooks";
import { getCartData } from "@/lib/server/cart";
import { useEffect } from "react";

export default function CartCount(cartCount, cartProductIds) {
     const { cart, setCart } = useCart();

     useEffect(() => {
          async function getCart() {
               const data = await getCartData();
               if (data) {
                    setCart({
                         cartCount: data.carTotalItems,
                         cartProductIds: data.cartProductIds,
                    });
               }
          }

          getCart();
     }, []);

     return <>{cart.cartCount ? <span>({cart.cartCount})</span> : ""}</>;
}
