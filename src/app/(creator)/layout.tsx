import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Mangrove Collection',
    description:
        'Discover unique, eco-friendly products at Mangrove Collection. Shop sustainable fashion, home decor, and lifestyle essentials crafted with nature in mind. Elevate your style while supporting a greener future.',
};

export default function CreatorLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            {children}
        </body>
    );
}
