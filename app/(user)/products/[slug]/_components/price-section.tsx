'use client';

import { useVariantUpdate } from '@/hooks';
import { useState } from 'react';

interface PriceSectionType {
    displayPrice: number;
}

export default function PriceSection({ displayPrice }: PriceSectionType) {
    const [price, setPrice] = useState<number>(displayPrice);

    const { variantSelectId, setVariantSelectId } = useVariantUpdate;

    return <>{price.toFixed(2)}</>;
}
