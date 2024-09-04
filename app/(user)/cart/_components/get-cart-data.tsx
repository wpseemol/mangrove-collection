'use client';
import { useCart } from '@/hooks';
import { getLocalStorageValue } from '@/utils/localstorage';
import { useEffect } from 'react';

export default function GetCartData() {
    const { setCart } = useCart();
    useEffect(() => {
        const cartItemArray = getLocalStorageValue();
        if (cartItemArray) {
            setCart((prev) => ({ ...prev, cartItems: cartItemArray }));
        }
    }, []);

    return <></>;
}
