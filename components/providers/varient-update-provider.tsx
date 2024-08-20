'use client';

import { VariantUpdateContext } from '@/contexts';
import { useState } from 'react';

export default function VariantContentUpdateProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [variantSelectId, setVariantSelectId] = useState<number>(0);

    const sendObj = { variantSelectId, setVariantSelectId };

    return (
        <>
            <VariantUpdateContext.Provider value={sendObj}>
                {children}
            </VariantUpdateContext.Provider>
        </>
    );
}
