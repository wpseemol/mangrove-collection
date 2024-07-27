'use client';

import { useVariantUpdate } from '@/app/hooks';
import { useEffect, useState } from 'react';

export default function PriceSection({ priceVariants, displayPrice }) {
    const [price, setPrice] = useState(displayPrice);

    const { variantSelectId } = useVariantUpdate();

    console.log('price variant:', priceVariants);
    useEffect(() => {
        if (variantSelectId) {
            const selectedPrice = priceVariants?.find(
                (item) => item?.variantId === variantSelectId
            ).price;
            setPrice(selectedPrice);
        }
    }, [variantSelectId, priceVariants]);

    return <>{price.toFixed(2)}</>;
}
