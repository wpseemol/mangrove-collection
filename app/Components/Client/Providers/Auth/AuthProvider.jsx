'use client';

import { AuthContext } from '@/contexts';
import { useState } from 'react';

export default function AuthProvider({ children, loginUser }) {
    const [auth, setAuth] = useState(loginUser ? loginUser : null);
    const [authLoading, setAuthLoading] = useState(false);

    return (
        <>
            <AuthContext.Provider
                value={[auth, setAuth, authLoading, setAuthLoading]}>
                {children}
            </AuthContext.Provider>
        </>
    );
}
