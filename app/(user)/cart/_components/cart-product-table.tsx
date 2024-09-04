'use client';

import { useCart } from '@/hooks';

export default function CartProductTable() {
    const { cart } = useCart();
    return (
        <div>
            <h1 className="text-7xl mb-10">Welcome to Cart page</h1>
            <h2 className="text-5xl">cart product has {cart.cartCount}</h2>
        </div>
    );
}
