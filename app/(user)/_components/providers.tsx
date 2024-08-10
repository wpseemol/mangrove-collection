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
                {children}
            </ThemeProvider>
        </>
    );
}
