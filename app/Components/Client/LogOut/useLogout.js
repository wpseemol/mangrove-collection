import { useAuth } from '@/app/hooks';
import removeCookie from '@/utils/removeCookie';
import { useRouter } from 'next/navigation';

export default function useLogout() {
    const [auth, setAuth] = useAuth();

    const router = useRouter();

    const handelLogout = function () {
        setAuth(null);
        removeCookie('email'); // email remove
        removeCookie('pass'); // remove pass

        router.push('/');
    };

    return { handelLogout };
}
