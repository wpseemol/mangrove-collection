'use client';

import { CartProductsContext } from '@/contexts';
import { useState } from 'react';

export default function CartProductsProvider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [loading, setLoading] = useState<boolean>(true);
    const [cartProducts, setCartProducts] = useState<CartProductsType[] | null>(
        null
    );

    const value: CartProductsContextType = {
        loading,
        setLoading,
        cartProducts,
        setCartProducts,
    };

    return (
        <>
            <CartProductsContext.Provider value={value}>
                {children}
            </CartProductsContext.Provider>
        </>
    );
}

interface CartProductsContextType {
    loading: boolean;
    setLoading: Dispatch<SetStateAction<boolean>>;
    cartProducts: CartProductsType[] | null;
    setCartProducts: Dispatch<SetStateAction<CartProductsType[] | null>>;
}

interface CartProductsType {
    quantity: number;
    price: number;
    slug: string;
    id: string;
    currency: string;
    name: string;
    thumbnail: string;
}
