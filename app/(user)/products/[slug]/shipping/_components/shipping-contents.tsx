'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useShipping } from '@/hooks';
import { useParams } from 'next/navigation';

export default function ShippingContents() {
    const params = useParams();

    const { shipping } = useShipping();

    return (
        <Card>
            <CardHeader
                className="flex-row justify-between items-center bg-neutral-800/10 px-5 py-3 rounded-t 
            space-y-0 font-medium border-b">
                <h2>Package 1 of 1</h2>
                <p>
                    <span className="font-normal text-sm">Shipped by</span>{' '}
                    Baseus Official Store
                </p>
            </CardHeader>
            <CardContent className="px-5 py-3 ">
                <p>{JSON.stringify(shipping)}</p>
            </CardContent>
        </Card>
    );
}
