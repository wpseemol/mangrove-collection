"use client";

import { useVariantUpdate } from "@/hooks";
import { useEffect, useState } from "react";

interface PriceSectionType {
     displayPrice: number;
     priceVariants: PriceType[];
}

export default function PriceSection({
     displayPrice,
     priceVariants,
}: PriceSectionType) {
     const [price, setPrice] = useState<number>(displayPrice);

     const { variantSelectId } = useVariantUpdate();

     useEffect(() => {
          if (variantSelectId) {
               const selectedPrice = priceVariants.find(
                    (price) => price.variantId === variantSelectId
               );

               if (selectedPrice?.price) setPrice(selectedPrice?.price);
          }
     }, [variantSelectId, priceVariants]);

     return <>{price.toFixed(2)}</>;
}

interface PriceType {
     variantId: string;
     price: number;
     select: boolean;
}
