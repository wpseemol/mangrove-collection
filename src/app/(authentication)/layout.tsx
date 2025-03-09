import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function AuthenticationLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth();

    if (!session) {
        return <>{children}</>;
    }

    redirect('/');
    return <></>;
}
