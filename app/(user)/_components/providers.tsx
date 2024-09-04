import PageChangeAnimation from '@/app/(user)/_components/page-change-animation';
import { auth } from '@/auth/auth';
import CartProvider from '@/components/providers/cart-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { SessionProvider } from 'next-auth/react';

export default async function Providers({
    children,
}: {
    children: React.ReactNode;
}) {
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
                    <CartProvider>
                        <PageChangeAnimation>{children}</PageChangeAnimation>
                    </CartProvider>
                </ThemeProvider>
            </SessionProvider>
        </>
    );
}
