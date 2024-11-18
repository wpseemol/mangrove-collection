'use client';

import { useShipping } from '@/hooks';
import { useRouter } from 'next/navigation';

export default function HasShippingItem() {
    const router = useRouter();

    const { shipping } = useShipping();

    if (!(shipping && shipping.length > 0)) {
        router.push('/');
    }

    return <></>;
}
