'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks';

export default function AccountPage() {
    const [auth] = useAuth();

    const route = useRouter();

    if (!auth) {
        route.push('/login');
    }

    return (
        <div className="text-center h-[calc(100vh-28.2rem)] text-xl mt-8">
            hello <span className="font-bold">{auth?.email}</span> welcome to
            our shop
        </div>
    );
}
