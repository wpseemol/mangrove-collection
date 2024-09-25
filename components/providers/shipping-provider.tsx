'use client';
import { ShippingContext } from '@/contexts';

export default function ShippingProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const obj = {};

    return (
        <ShippingContext.Provider value={obj}>
            {children}
        </ShippingContext.Provider>
    );
}
