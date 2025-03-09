import { auth } from '@/auth';
import { ADMIN } from '@/lib/constant';
import { notFound } from 'next/navigation';
import React from 'react';

export default async function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth();

    if (session && session.user.role === ADMIN) {
        return <>{children}</>;
    }

    notFound();
    return <></>;
}
