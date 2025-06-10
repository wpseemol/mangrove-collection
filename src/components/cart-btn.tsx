"use client";

import { useCart } from "@/hooks";
import { setCartData } from "@/lib/server/cart";
import { useState } from "react";
import { Button } from "./ui/button";

export default function CartBtn({
     productId,
     selectedPriceId,
}: {
     productId: string;
     selectedPriceId: string;
}) {
     const [loading, setLoading] = useState<boolean>(false);

     const { cart, setCart } = useCart();

     async function handleCard() {
          setLoading(true);
          try {
               const isCart = await setCartData(productId, selectedPriceId, 1);
               if (isCart) {
                    setCart({
                         cartCount: isCart.carTotalItems,
                         cartProductIds: isCart.cartProductIds,
                    });
               }
          } catch (error) {
               console.log("cart button error:", error);
          } finally {
               setLoading(false);
          }
     }

     const isAlreadyCard = cart.cartProductIds.includes(productId);
     return (
          <Button
               onClick={() => {
                    if (!isAlreadyCard) handleCard();
               }}
               disabled={isAlreadyCard || loading}
               variant="default"
               size="sm"
               className={`text-neutral-100 hover:bg-primary-foreground disabled:pointer-events-auto cursor-pointer text-xs ${
                    loading
                         ? "disabled:cursor-progress"
                         : "disabled:cursor-not-allowed"
               }`}
          >
               {isAlreadyCard ? (
                    "Added"
               ) : (
                    <>
                         <span className="hidden sm:inline">
                              {loading ? "Cart..." : "Add to Cart"}
                         </span>
                         <span className="sm:hidden">
                              {loading ? "Cart..." : "Cart"}
                         </span>
                    </>
               )}
          </Button>
     );
}
