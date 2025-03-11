'use client';

import { PurchaseContext } from '@/contexts';
import { useState } from 'react';

export default function PurchProvider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [buyProducts, setBuyProducts] = useState<Products[] | null>(null);

    const value = {
        buyProducts,
        setBuyProducts,
    };

    return (
        <>
            <PurchaseContext.Provider value={value}>
                {children}
            </PurchaseContext.Provider>
        </>
    );
}

interface Products {
    productId: string | number;
    quantity: number;
}
