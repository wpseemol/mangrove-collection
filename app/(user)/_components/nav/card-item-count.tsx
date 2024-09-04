'use client';

import { useCart } from '@/hooks';

export default function CartCount() {
    const { cart } = useCart();

    if (cart.cartCount && cart.cartCount > 0) {
        return <span>({cart.cartCount})</span>;
    }

    return <></>;
}
