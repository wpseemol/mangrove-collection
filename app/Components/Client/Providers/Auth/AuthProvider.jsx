'use client';

import { AuthContext } from '@/contexts';
import { useState } from 'react';

export default function AuthProvider({ children }) {
    const [auth, setAuth] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    return (
        <>
            <AuthContext.Provider
                value={[auth, setAuth, authLoading, setAuthLoading]}>
                {children}
            </AuthContext.Provider>
        </>
    );
}
