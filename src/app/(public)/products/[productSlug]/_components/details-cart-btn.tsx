"use client";

import { Button } from "@/components/ui/button";
import { useCart, useVariantUpdate } from "@/hooks";
import { setCartData } from "@/lib/server/cart";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function DetailsCartBtn({
     productId,
     selectedPriceId,
}: {
     productId: string;
     selectedPriceId: string;
}) {
     const searchParams = useSearchParams();
     const quantity = parseInt(searchParams.get("quantity") ?? "1", 10);

     const [loading, setLoading] = useState<boolean>(false);

     const { cart, setCart } = useCart();
     const { variantSelectId } = useVariantUpdate();

     const selectedPriceIdStore = variantSelectId || selectedPriceId;

     async function handelCart() {
          setLoading(true);

          try {
               const isCart = await setCartData(
                    productId,
                    selectedPriceIdStore,
                    quantity
               );
               if (isCart) {
                    setCart({
                         cartCount: isCart.carTotalItems,
                         cartProductIds: isCart.cartProductIds,
                    });
               }
          } catch (error) {
               console.log("Details page Cart error:", error);
          } finally {
               setLoading(false);
          }
     }

     const isAlreadyCard: boolean = cart.cartProductIds.includes(
          productId.toString()
     );

     return (
          <Button
               onClick={() => {
                    if (!isAlreadyCard || !loading) handelCart();
               }}
               disabled={isAlreadyCard || loading}
               variant="outline"
               size="sm"
               className="px-5 sm:w-fit w-[60px]"
          >
               {isAlreadyCard ? (
                    "Added"
               ) : (
                    <>
                         <span className="hidden sm:inline">
                              {loading ? "loading..." : "Add to Cart"}
                         </span>
                         <span className="sm:hidden">
                              {loading ? "loading..." : "Cart"}
                         </span>
                    </>
               )}
          </Button>
     );
}
