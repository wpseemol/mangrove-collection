'use client';
import setCookiesUniqueIdentifier from '@/action/set-unique-identifier';
import { CartContext, CartType } from '@/contexts';
import { getLocalStorageValue } from '@/utils/localstorage';
import { useSession } from 'next-auth/react';
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
        cartProductLoading: false,
    });

    const { data } = useSession();

    const sendObj = { cart, setCart };

    async function getCartData() {
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
        }

        await setCookiesUniqueIdentifier();
    }

    useEffect(() => {
        getCartData();
    }, [data]);

    return (
        <CartContext.Provider value={sendObj}>{children}</CartContext.Provider>
    );
}
