'use client';

import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function DetailsCartBtn({ productId }: { productId: string }) {
    const searchParams = useSearchParams();
    const quantity = parseInt(searchParams.get('quantity') ?? '1', 10);

    const [loading, setLoading] = useState<boolean>(false);

    const { cart, setCart } = useCart();

    async function handelCart() {
        setLoading(true);
        const cartProduct: CartProduct = {
            productId,
            quantity,
        };

        try {
            const response = await fetch(`/api/v1/cart/set`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cartProduct),
            });

            if (response.ok) {
                const responseData = await response.json();
                if (responseData.success) {
                    setCart({
                        cartCount: responseData.totalItems,
                        cartProductIds: responseData.productIds,
                    });
                }
            }
        } catch (error) {
            console.error('Details page Cart error:', error);
        } finally {
            setLoading(false);
        }
    }

    const isAlreadyCard: boolean = cart.cartProductIds.includes(
        productId.toString()
    );

    return (
        <Button
            onClick={() => {
                if (!isAlreadyCard || !loading) handelCart();
            }}
            disabled={isAlreadyCard || loading}
            variant="outline"
            size="sm"
            className="px-5 sm:w-fit w-[60px]">
            {isAlreadyCard ? (
                'Added'
            ) : (
                <>
                    <span className="hidden sm:inline">
                        {loading ? 'loading...' : 'Add to Cart'}
                    </span>
                    <span className="sm:hidden">
                        {loading ? 'loading...' : 'Cart'}
                    </span>
                </>
            )}
        </Button>
    );
}

interface CartProduct {
    productId: string;
    quantity: number;
}
