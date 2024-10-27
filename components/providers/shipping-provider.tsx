'use client';
import { ShippingContext } from '@/contexts';
import { Shipping } from '@/types/shipping';
import { useState } from 'react';

export default function ShippingProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [shipping, setShipping] = useState<Shipping[] | null>(null);

    const obj = { shipping, setShipping };

    return (
        <ShippingContext.Provider value={obj}>
            {children}
        </ShippingContext.Provider>
    );
}
