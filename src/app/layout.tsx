import type { Metadata } from 'next';
import './globals.css';

import { Poppins, Roboto } from 'next/font/google';

const poppins = Poppins({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
});
const roboto = Roboto({ subsets: ['latin'], weight: ['400', '500', '700'] });

export const metadata: Metadata = {
    title: 'Mangrove Collection',
};
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning className='scroll-smooth'>
            <body
                className={`${poppins.className} ${roboto.className}`}
                >
                {children}
            </body>
        </html>
    );
}