"use client";

import { useVariantUpdate } from "@/hooks";
import { useEffect, useState } from "react";

interface PriceSectionType {
     displayPrice: number;
     priceVariants: string;
}

export default function PriceSection({
     displayPrice,
     priceVariants,
}: PriceSectionType) {
     const priceVariantsArray = JSON.parse(priceVariants) as PriceType[];

     const [price, setPrice] = useState<number>(displayPrice);

     const { variantSelectId } = useVariantUpdate();

     useEffect(() => {
          if (variantSelectId) {
               const selectedPrice = priceVariantsArray.find(
                    (price) => price.variantId === variantSelectId
               );

               if (selectedPrice?.price) setPrice(selectedPrice?.price);
          }
     }, [variantSelectId, priceVariantsArray]);

     return <>{price.toFixed(2)}</>;
}

interface PriceType {
     variantId: string;
     price: number;
     select: boolean;
}
