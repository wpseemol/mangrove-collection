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
    });

    const sendObj = { cart, setCart };

    useEffect(() => {
        const cartItemArray = getLocalStorageValue();
        if (cartItemArray) {
            setCart((prev) => ({ ...prev, cartCount: cartItemArray.length }));
        }
    }, []);

    return (
        <CartContext.Provider value={sendObj}>{children}</CartContext.Provider>
    );
}
