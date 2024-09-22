'use client';

import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks';

export default function CartMultiDeleted() {
    const { setCart, orderSummary } = useCart();

    function handelMultiDeleted() {
        console.log('multi deleted', orderSummary);
    }

    return (
        orderSummary &&
        orderSummary.length > 0 && (
            <Button onClick={handelMultiDeleted}>
                Deleted (
                {orderSummary.length > 1
                    ? orderSummary.length + ' items'
                    : orderSummary.length + ' item'}
                )
            </Button>
        )
    );
}
