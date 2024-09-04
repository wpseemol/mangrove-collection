'use client';
import { CartContext, CartType } from '@/contexts';
import { useState } from 'react';

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

    return (
        <CartContext.Provider value={sendObj}>{children}</CartContext.Provider>
    );
}
