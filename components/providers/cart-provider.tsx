'use client';
import { CartContext, CartType } from '@/contexts';
import { getLocalStorageValue } from '@/utils/localstorage';
import { useEffect, useState } from 'react';

export default function CartProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [cart, setCart] = useState<CartType>({
        cartItems: null,
        cartCount: null,
        cartProducts: null,
        loading: false,
    });

    const sendObj = { cart, setCart };

    async function getCartData() {
        setCart((prev) => ({ ...prev, loading: true }));
        try {
            const cartItemArray = getLocalStorageValue();
            if (cartItemArray) {
                setCart((prev) => ({
                    ...prev,
                    cartItems: cartItemArray,
                    cartCount: cartItemArray.length,
                }));
            }
        } catch (error) {
            throw error;
        } finally {
            setCart((prev) => ({ ...prev, loading: false }));
        }
    }

    useEffect(() => {
        getCartData();
    }, []);

    return (
        <CartContext.Provider value={sendObj}>{children}</CartContext.Provider>
    );
}
