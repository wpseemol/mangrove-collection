import PageChangeAnimation from '@/app/(user)/_components/page-change-animation';
import { ThemeProvider } from '@/components/theme-provider';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <>
            <ThemeProvider
                attribute="class"
                defaultTheme="green"
                themes={['green', 'dark', 'light']}
                enableSystem
                disableTransitionOnChange>
                <PageChangeAnimation>{children}</PageChangeAnimation>
            </ThemeProvider>
        </>
    );
}
