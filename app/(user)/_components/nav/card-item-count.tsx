'use client';

import { useCart } from '@/hooks';

export default function CartCount() {
    const { cart } = useCart();

    console.log('cart count:', cart);

    if (cart.cartCount && cart.cartCount > 0) {
        return <span>({cart.cartCount})</span>;
    }

    return <></>;
}
