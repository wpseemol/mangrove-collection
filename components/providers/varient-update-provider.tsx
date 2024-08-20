'use client';

import { VariantUpdateContext } from '@/contexts';
import { useState } from 'react';

export default function VariantContentUpdateProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [variantSelectId, setVariantSelectId] = useState<string>('');

    const sendObj = { variantSelectId, setVariantSelectId };

    return (
        <>
            <VariantUpdateContext.Provider value={sendObj}>
                {children}
            </VariantUpdateContext.Provider>
        </>
    );
}
