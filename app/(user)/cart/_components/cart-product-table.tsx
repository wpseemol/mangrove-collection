'use client';

import { useCart } from '@/hooks';

export default function CartProductTable() {
    const { cart } = useCart();
    return (
        <div>
            <p>this is cart table</p>
        </div>
    );
}
