import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function LoginWithGoogle() {
    const [loading, setLoading] = useState<boolean>(false);

    // This should be checked inside useEffect if needed

    async function handleGoogleLogin() {
        try {
            setLoading(true);
            const res = await signIn('google', {
                callbackUrl: '/',
            });

            if (res?.error) {
                toast.error(res.code);
            }
        } catch (error) {
            toast.error('Login failed');
            console.log(error);
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
