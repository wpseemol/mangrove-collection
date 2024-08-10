import PageChangeAnimation from '@/app/(user)/_components/page-change-animation';
import { ThemeProvider } from '@/components/theme-provider';

export default function Providers({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <ThemeProvider
                attribute="class"
                defaultTheme="light"
                themes={['green', 'dark', 'light']}
                enableSystem
                disableTransitionOnChange>
                <PageChangeAnimation>{children}</PageChangeAnimation>
            </ThemeProvider>
        </>
    );
}
