'use client';
import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';

import { useState } from 'react';

export default function LoginWithGoogle() {
    const [loading, setLoading] = useState<boolean>(false);

    async function handleGoogleLogin() {
        try {
            setLoading(true);
            await signIn('google', {
                callbackUrl: '/',
            });
        } catch (error) {
            console.error('Login withe google error:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full mt-4">
            {loading ? 'Logging in...' : 'Login with Google'}
        </Button>
    );
}
