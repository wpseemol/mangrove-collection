'use client';

import { animationPageIn } from '@/utils/animation';
import { useEffect } from 'react';

export default function PageChangeAnimation({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    useEffect(() => {
        animationPageIn();
    }, []);
    return (
        <>
            {children}
            <div
                id="banner-1"
                className="min-h-screen bg-neutral-900 z-[100] fixed top-0 left-0 w-1/4"></div>
            <div
                id="banner-2"
                className="min-h-screen bg-neutral-900 z-[100] fixed top-0 left-1/4 w-1/4"></div>
            <div
                id="banner-3"
                className="min-h-screen bg-neutral-900 z-[100] fixed top-0 left-2/4 w-1/4"></div>
            <div
                id="banner-4"
                className="min-h-screen bg-neutral-900 z-[100] fixed top-0 left-3/4 w-1/4"></div>
        </>
    );
}
