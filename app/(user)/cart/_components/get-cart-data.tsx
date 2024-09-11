'use client';
import { useCart } from '@/hooks';
import { getLocalStorageValue } from '@/utils/localstorage';
import { useEffect } from 'react';

export default function GetCartData() {
    const { cart, setCart } = useCart();

    console.log(cart);

    async function fetchCartData() {
        try {
            const cartItems = getLocalStorageValue();
            if (cartItems) {
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
                }
            }
        } catch (error) {
            throw error;
        } finally {
            setCart((prev) => ({ ...prev, cartProductLoading: false }));
        }
    }

    useEffect(() => {
        setCart((prev) => ({ ...prev, cartProductLoading: true }));
        /**
         * fetch data from cart data here
         */

        fetchCartData();
    }, []);

    return <></>;
}
