'use client';

import { CartProductsContext } from '@/contexts';
import { Dispatch, SetStateAction, useState } from 'react';

export default function CartProductsProvider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [loading, setLoading] = useState<boolean>(true);
    const [cartProducts, setCartProducts] = useState<CartProductsType[] | null>(
        null
    );

    const [cartSelectedProducts, setCartSelectedProducts] = useState<
        CartSelectedProductsType[] | null
    >(null);

    const value: CartProductsContextType = {
        loading,
        setLoading,
        cartProducts,
        setCartProducts,
        cartSelectedProducts,
        setCartSelectedProducts,
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
    cartSelectedProducts: CartSelectedProductsType[] | null;
    setCartSelectedProducts: Dispatch<
        SetStateAction<CartSelectedProductsType[] | null>
    >;
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

interface CartSelectedProductsType {
    id: string;
    quantity: number;
    currency: string;
    price: number;
}
