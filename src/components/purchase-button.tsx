'use client';
import { usePurchase } from '@/hooks';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from './ui/button';

export default function PurchaseButton({
    productId,
}: {
    productId: string | number;
}) {
    const router = useRouter();

    const [loading, setLoading] = useState<boolean>(false);

    const { setBuyProducts } = usePurchase();
    async function handlePurchase() {
        setLoading(true);
        const purchaseItems: PurchaseItem[] = [
            { productId: productId.toString(), quantity: 1 },
        ];

        setBuyProducts(purchaseItems);

        try {
            /**
             * [{productId:string , quantity: number}]
             */
            await fetch(`/api/v1/purchase/set`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(purchaseItems),
            });
        } catch (error) {
            console.error('Product bye error:', error);
        } finally {
            setLoading(false);
        }

        router.push('/checkout');
    }
    return (
        <Button
            disabled={loading}
            onClick={handlePurchase}
            variant="default"
            size="sm"
            className="text-neutral-100 hover:bg-primary-foreground 
                            group-hover:animate-jump animate-once animate-duration-[3000ms]
                            shadow-xl">
            <span className="hidden sm:inline ">
                {loading ? 'Buy...' : 'Buy Now'}{' '}
            </span>
            <span className="sm:hidden">{loading ? '...' : 'Buy'} </span>
        </Button>
    );
}

interface PurchaseItem {
    productId: string;
    quantity: number;
}
