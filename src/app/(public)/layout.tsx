import React from 'react';
import Footer from './_components/footer';
import Header from './_components/header';
import UserProviders from './_components/user-providers';

/**
 * Meta is not need here Root Already has.
 *
 */

export default function UserLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <UserProviders>
                <Header />
                {children}
                <Footer />
            </UserProviders>
        </>
    );
}
