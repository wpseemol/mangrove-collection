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

    useEffect(() => {
        const cartItemArray = getLocalStorageValue();
        if (cartItemArray) {
            setCart((prev) => ({
                ...prev,
                cartItems: cartItemArray,
                cartCount: cartItemArray.length,
            }));
        }
    }, []);

    return (
        <CartContext.Provider value={sendObj}>{children}</CartContext.Provider>
    );
}
