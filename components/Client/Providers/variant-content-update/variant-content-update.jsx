'use client';
import { VariantUpdateContext } from '@/contexts';
import { useState } from 'react';

export default function VariantContentUpdateProvider({ children }) {
    const [variantSelectId, setVariantSelectId] = useState('');

    const sendObj = { variantSelectId, setVariantSelectId };

    return (
        <>
            <VariantUpdateContext.Provider value={sendObj}>
                {children}
            </VariantUpdateContext.Provider>
        </>
    );
}
