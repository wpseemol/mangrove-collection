'use client';
import { useCart } from '@/hooks';
import { getLocalStorageValue } from '@/utils/localstorage';
import { useEffect } from 'react';

export default function GetCartData() {
    const { cart, setCart } = useCart();

    async function fetchCartData() {
        try {
            const cartItems = getLocalStorageValue();
            if (cartItems && cartItems.length > 0) {
                const queryString = new URLSearchParams({
                    'cart-items': cartItems.join('|'),
                }).toString();

                const response = await fetch(`/api/v1/cart?${queryString}`);

                if (response.ok) {
                    const data = await response.json();
                    setCart((prev) => ({
                        ...prev,
                        cartProducts: data.cartProducts,
                    }));
                } else {
                    console.error(
                        'Failed to fetch cart data:',
                        response.statusText
                    );
                }
            }
        } catch (error) {
            console.error('An error occurred while fetching cart data:', error);
        } finally {
            setCart((prev) => ({ ...prev, cartProductLoading: false }));
        }
    }

    useEffect(() => {
        setCart((prev) => ({ ...prev, cartProductLoading: true }));
        fetchCartData();
    }, [cart.cartItems]);

    return null;
}
