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
        <div className="text-center">
            hello {auth?.email} welcome to our shop
        </div>
    );
}
