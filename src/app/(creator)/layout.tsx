import { auth } from '@/auth';
import { CREATOR } from '@/lib/constant';
import { notFound } from 'next/navigation';
import React from 'react';

export default async function CreatorLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth();

    if (session && session.user.role === CREATOR) {
        return <>{children}</>;
    }

    notFound();
    return <></>;
}
