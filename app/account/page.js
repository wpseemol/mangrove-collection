'use client';

import { notFound, useRouter } from 'next/navigation';
import { useAuth } from '../hooks';

export default function AccountPage() {
    const [auth] = useAuth();

    const route = useRouter();

    if (!auth) {
        notFound();
    }

    return (
        <>
            {!!auth && (
                <div className="text-center h-[calc(100vh-28.2rem)] text-xl mt-8">
                    hello <span className="font-bold">{auth?.fullName}</span>{' '}
                    welcome to our shop
                </div>
            )}
        </>
    );
}
