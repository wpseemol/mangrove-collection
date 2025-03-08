import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function LoginWithGoogle() {
    const [loading, setLoading] = useState<boolean>(false);

    async function handelGoogleLogin() {
        setLoading(true);
        const loginResponse = await signIn('google', {
            redirect: true,
            redirectTo: '/profile',
        });
        setLoading(false);
        console.log('login Response', loginResponse);
    }

    return (
        <Button
            onClick={handelGoogleLogin}
            variant="outline"
            className="w-full mt-4">
            {loading ? 'Login...' : 'Login with Google'}
        </Button>
    );
}
