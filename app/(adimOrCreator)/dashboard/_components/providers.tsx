import { ThemeProvider } from '@/components/theme-provider';
import { SessionProvider } from 'next-auth/react';

export default function Providers({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <SessionProvider>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="green"
                    themes={['green', 'dark', 'light']}
                    enableSystem
                    disableTransitionOnChange>
                    {children}
                </ThemeProvider>
            </SessionProvider>
        </>
    );
}
