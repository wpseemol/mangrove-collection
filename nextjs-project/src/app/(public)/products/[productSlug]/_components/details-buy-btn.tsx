"use client";

import { Button } from "@/components/ui/button";
import { useVariantUpdate } from "@/hooks";
import { setPurchaseData } from "@/lib/actions/purchase";
import { PurchaseItemType } from "@/types/purchase";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function DetailsBuyBtn({
     productId,
     selectedPriceId,
}: {
     productId: string;
     selectedPriceId: string;
}) {
     const searchParams = useSearchParams();
     const router = useRouter();
     const quantity = parseInt(searchParams.get("quantity") ?? "1", 10);

     const [loading, setLoading] = useState<boolean>(false);

     const { variantSelectId } = useVariantUpdate();

     async function handlePurchase() {
          setLoading(true);
          const purchaseProduct: PurchaseItemType[] = [
               {
                    productId,
                    quantity,
                    selectedPriceId: variantSelectId || selectedPriceId,
               },
          ];
          try {
               /**
                * [{productId:string , quantity: number,selectedPriceId:string}] }]
                */
               await setPurchaseData(purchaseProduct);
          } catch (error) {
               console.log("Details page Purchus error:", error);
          } finally {
               setLoading(false);
          }

          router.push("/checkout");
     }

     return (
          <Button
               onClick={() => handlePurchase()}
               variant="default"
               size="sm"
               className="text-neutral-100 hover:bg-primary-foreground px-5"
          >
               <span className="hidden sm:inline ">
                    {loading ? "Buy..." : "Buy Now"}{" "}
               </span>
               <span className="sm:hidden">{loading ? "..." : "Buy"} </span>
          </Button>
     );
}
