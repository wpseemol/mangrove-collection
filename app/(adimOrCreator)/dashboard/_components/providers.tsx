import { auth } from '@/auth/auth';
import { ThemeProvider } from '@/components/theme-provider';
import { SessionProvider } from 'next-auth/react';

export default async function Providers({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth();
    return (
        <>
            <SessionProvider session={session}>
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
