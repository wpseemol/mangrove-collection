'use client';
import { CartContext } from '@/contexts';
import { useState } from 'react';

export default function CartProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [cartItems, setCartItem] = useState<string[] | null>(null);

    const sendObj = { cartItems, setCartItem };

    return (
        <CartContext.Provider value={sendObj}>{children}</CartContext.Provider>
    );
}
