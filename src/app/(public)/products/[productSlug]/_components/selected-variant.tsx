"use client";

import { useVariantUpdate } from "@/hooks";
import { useEffect } from "react";

interface SelectedVariantType {
     type: string;
     variants?: string;
     displayPrice?: string;
}

export default function SelectedVariant({
     type,
     variants,
     displayPrice,
}: SelectedVariantType) {
     const variantsArray = JSON.parse(variants) as VariantsType[];
     const displayPriceParse = JSON.parse(displayPrice) as PriceType;

     const { variantSelectId, setVariantSelectId } = useVariantUpdate();

     const typeVariants = variantsArray?.filter(
          (variant) => variant?.type === type
     );

     function handelSelectVariant(selectedId: string) {
          setVariantSelectId(selectedId);
     }

     useEffect(() => {
          if (displayPriceParse?.variantId) {
               setVariantSelectId(displayPriceParse?.variantId);
          }
     }, [displayPriceParse?.variantId, setVariantSelectId]);

     return typeVariants?.map((variant) => (
          <button
               onClick={() => handelSelectVariant(variant?.id)}
               key={variant?.id}
               className={`${
                    variant?.id === variantSelectId
                         ? "bg-primary-foreground text-white hover:bg-primary"
                         : "bg-neutral-300/60 text-neutral-600"
               } duration-150 py-1 px-2 rounded capitalize
                    cursor-pointer`}
          >
               {variant?.title}
          </button>
     ));
}

interface PriceType {
     variantId: string;
     price: number;
     select: boolean;
}

interface VariantsType {
     id: string;
     type: string;
     title: string;
}
