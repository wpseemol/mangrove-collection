import PageChangeAnimation from '@/app/(user)/_components/page-change-animation';
import { ThemeProvider } from '@/components/theme-provider';
import { SessionProvider } from 'next-auth/react';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <>
            <SessionProvider>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="green"
                    themes={['green', 'dark', 'light']}
                    enableSystem
                    disableTransitionOnChange>
                    <PageChangeAnimation>{children}</PageChangeAnimation>
                </ThemeProvider>
            </SessionProvider>
        </>
    );
}
