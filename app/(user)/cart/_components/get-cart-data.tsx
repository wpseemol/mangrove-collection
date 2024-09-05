'use client';
import { useCart } from '@/hooks';
import { useEffect } from 'react';

export default function GetCartData() {
    const { setCart } = useCart();
    useEffect(() => {
        /**
         * fetch data from cart data here
         */
    }, []);

    return <></>;
}
