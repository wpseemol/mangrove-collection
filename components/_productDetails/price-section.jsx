'use client';

import { useVariantUpdate } from '@/app/hooks';
import { useEffect, useState } from 'react';

export default function PriceSection({ priceVariants, displayPrice }) {
    const [price, setPrice] = useState(displayPrice);

    const { variantSelectId, setVariantSelectId } = useVariantUpdate();

    useEffect(() => {
        if (variantSelectId) {
            const selectedPrice = priceVariants?.find(
                (item) => item?.variantId === variantSelectId
            ).price;
            setPrice(selectedPrice);
        }
    }, [variantSelectId, priceVariants]);

    useEffect(() => {
        const findDefaultPrice = priceVariants?.find(
            (item) => item?.select
        ).variantId;
        setVariantSelectId(findDefaultPrice);

        console.log('test for runtime');
    }, [priceVariants, setVariantSelectId]);

    return <>{price.toFixed(2)}</>;
}
