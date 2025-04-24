'use client';

import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function DetailsBuyBtn({ productId }: { productId: string }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const quantity = parseInt(searchParams.get('quantity') ?? '1', 10);

    const [loading, setLoading] = useState<boolean>(false);

    async function handlePurchase() {
        setLoading(true);
        const purchaseProduct: PurchaseProduct[] = [
            {
                productId,
                quantity,
            },
        ];
        try {
            await fetch(`/api/v1/purchase/set`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(purchaseProduct),
            });
        } catch (error) {
            console.error('Details page Purchus error:', error);
        } finally {
            setLoading(false);
        }

        router.push('/checkout');
    }

    return (
        <Button
            onClick={() => handlePurchase()}
            variant="default"
            size="sm"
            className="text-neutral-100 hover:bg-primary-foreground px-5">
            <span className="hidden sm:inline ">
                {loading ? 'Buy...' : 'Buy Now'}{' '}
            </span>
            <span className="sm:hidden">{loading ? '...' : 'Buy'} </span>
        </Button>
    );
}

interface PurchaseProduct {
    productId: string;
    quantity: number;
}
