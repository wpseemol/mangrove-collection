import { ThemeProvider } from '@/components/theme-provider';
import React from 'react';


export default function PublicProviders({
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
                {children}
            </ThemeProvider>
        </>
    );
}
