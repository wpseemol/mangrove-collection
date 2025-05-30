"use client";

import { setPurchaseData } from "@/lib/server/purchase";
import { PurchaseItemType } from "@/types/purchase";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/button";

export default function PurchaseBtn({
     productId,
     selectedPriceId,
}: {
     productId: string;
     selectedPriceId: string;
}) {
     const router = useRouter();
     const [loading, setLoading] = useState<boolean>(false);

     async function handlePurchase() {
          setLoading(true);
          const purchaseItems: PurchaseItemType[] = [
               {
                    productId: productId.toString(),
                    quantity: 1,
                    selectedPriceId: selectedPriceId,
               },
          ];

          try {
               /**
                * [{productId:string , quantity: number,selectedPriceId:string}] }]
                */
               await setPurchaseData(purchaseItems);
          } catch (error) {
               console.log("Product bye error:", error);
          } finally {
               setLoading(false);
          }

          router.push("/checkout");
     }

     return (
          <Button
               disabled={loading}
               onClick={handlePurchase}
               variant="default"
               size="sm"
               className={`text-neutral-100 hover:bg-primary-foreground 
                     group-hover:animate-jump animate-once animate-duration-[3000ms]
                     shadow-xl disabled:pointer-events-auto cursor-pointer ${
                          loading
                               ? "disabled:cursor-progress"
                               : "disabled:cursor-not-allowed"
                     }`}
          >
               <span className="hidden sm:inline ">
                    {loading ? "Buy..." : "Buy Now"}{" "}
               </span>
               <span className="sm:hidden">{loading ? "..." : "Buy"} </span>
          </Button>
     );
}
