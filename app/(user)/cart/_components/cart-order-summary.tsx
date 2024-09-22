'use client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useCart } from '@/hooks';

export default function CartOrderSummary() {
    const { orderSummary } = useCart();

    return (
        <Card className={` p-5 md:my-10 my-5 h-fit`}>
            <CardHeader className="p-0 font-medium">Order Summary</CardHeader>
            <CardContent>
                <pre>{JSON.stringify(orderSummary)}</pre>
            </CardContent>
        </Card>
    );
}
