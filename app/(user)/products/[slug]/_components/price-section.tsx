'use client';

import { useState } from 'react';

interface PriceSectionType {
    displayPrice: number;
}

export default function PriceSection({ displayPrice }: PriceSectionType) {
    const [price, setPrice] = useState(displayPrice);

    return <>{price.toFixed(2)}</>;
}
