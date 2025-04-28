"use client";
import { useCart } from "@/hooks";
import { CartItemType } from "@/lib/server/cart";
import { useEffect } from "react";

export default function CartCount({
     data,
}: {
     data: {
          cartProductIds: string[];
          cartItem: CartItemType[];
          carTotalItems: number;
     } | null;
}) {
     const { cart, setCart } = useCart();

     useEffect(() => {
          if (data) {
               setCart({
                    cartCount: data.carTotalItems,
                    cartProductIds: data.cartProductIds,
               });
          }
     }, [data, setCart]);

     return <>{cart.cartCount ? <span>({cart.cartCount})</span> : ""}</>;
}
