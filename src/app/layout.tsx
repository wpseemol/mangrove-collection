import React from 'react';
import RootProviders from './_components/root-providers';
import './globals.css';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="scroll-smooth green">
            <RootProviders>{children}</RootProviders>
        </html>
    );
}
