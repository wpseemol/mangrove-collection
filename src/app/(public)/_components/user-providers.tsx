import { ThemeProvider } from '@/components/theme-provider';
import React from 'react';
import CartProvider from './cart-provider';
import PurchProvider from './purch-provider';

export default function UserProviders({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <ThemeProvider
                attribute="class"
                defaultTheme="green"
                themes={['green', 'dark', 'light']}
                enableSystem
                disableTransitionOnChange>
                <CartProvider>
                    <PurchProvider>{children}</PurchProvider>
                </CartProvider>
            </ThemeProvider>
        </>
    );
}
