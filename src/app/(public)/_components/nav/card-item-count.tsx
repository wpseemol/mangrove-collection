'use client';

import { useCart } from '@/hooks';
import { useEffect } from 'react';

export default function CartCount() {
    const { cart, setCart } = useCart();

    useEffect(() => {
        async function getCatFetch() {
            try {
                const response = await fetch(`/api/v1/cart/get`);

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
                console.log(error);
            }
        }
        getCatFetch();
    }, [setCart]);

    return (
        cart.cartCount && (
            <>
                {' '}
                <span>({cart.cartCount})</span>
            </>
        )
    );
}
