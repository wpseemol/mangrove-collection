import '@/app/globals.css';

import Providers from '@/app/(user)/_components/providers';
import { Poppins, Roboto } from 'next/font/google';
import Footer from './_components/footer';
import Header from './_components/header';

const poppins = Poppins({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
});
const roboto = Roboto({ subsets: ['latin'], weight: ['400', '500', '700'] });

export const metadata = {
    title: 'Mangrove Collection',
    description: 'Mangrove Collection is shopping project ',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="scroll-smooth dark">
            <body
                className={poppins.className + ' ' + roboto.className}
                suppressHydrationWarning={true}>
                <Providers>
                    <Header />
                    {children}
                    <Footer />
                </Providers>
            </body>
        </html>
    );
}
