"use client";

import { setCartData } from "@/lib/server/cart";
import { useState } from "react";
import { Button } from "./ui/button";

export default function CartBtn({
     productId,
     selectedPriceId,
}: {
     productId: string;
     selectedPriceId: string | undefined;
}) {
     const [loading, setLoading] = useState<boolean>(false);

     async function handleCard(id) {
          setLoading(true);
          try {
               const isCart = await setCartData(productId, selectedPriceId, 1);
               console.log("is cart data:", isCart);
          } catch (error) {
               console.error("cart button error:", error);
          } finally {
               setLoading(false);
          }
     }

     const isAlreadyCard = false;
     return (
          <Button
               onClick={() => {
                    if (!isAlreadyCard) handleCard(productId);
               }}
               disabled={isAlreadyCard}
               variant="default"
               size="sm"
               className="text-neutral-100 hover:bg-primary-foreground"
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
