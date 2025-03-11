'use client';

import { usePurchase } from '@/hooks';
import { notFound } from 'next/navigation';

export default function CheckPurchase({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { buyProducts } = usePurchase();

    return <>{children}</>;

    if (buyProducts) {
        return <>{children}</>;
    } else {
        notFound();
        return <></>;
    }
}
