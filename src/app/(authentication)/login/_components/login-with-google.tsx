import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

import { useState } from 'react';
import { toast } from 'sonner';

export default function LoginWithGoogle() {
    const [loading, setLoading] = useState<boolean>(false);

    const searchParams = useSearchParams();
    const code = searchParams.get('code');

    console.log(searchParams.get('code'));

    async function handelGoogleLogin() {
        setLoading(true);
        await signIn('google', {
            redirect: true,
            redirectTo: '/',
        });
        setLoading(false);

        if (code) {
            toast.error(code);
            return;
        }
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
