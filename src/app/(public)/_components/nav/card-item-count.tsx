'use client';

import { useEffect, useState } from 'react';

export default function CartCount() {
    const [count, setCount] = useState<number | null>(0);

    // const { cart } = useCart();

    // if (cart.cartCount && cart.cartCount > 0) {
    //     return <span>({cart.cartCount})</span>;
    // }

    useEffect(() => {
        async function getCat() {
            try {
                const response = await fetch(`/api/v1/cart/get`);

                const responseData = await response.json();

                setCount(responseData.totalItems);
            } catch (error) {
                console.log(error);
                setCount(0);
            }
        }
        getCat();
    }, []);

    return (
        <>
            {' '}
            <span>({count})</span>
        </>
    );
}
