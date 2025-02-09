import type { Metadata } from 'next';
import { Poppins, Roboto } from 'next/font/google';
import Footer from './_components/footer';
import Header from './_components/header';

const poppins = Poppins({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
});
const roboto = Roboto({ subsets: ['latin'], weight: ['400', '500', '700'] });

export const metadata: Metadata = {
    title: 'Mangrove Collection',
    description:
        'Discover unique, eco-friendly products at Mangrove Collection. Shop sustainable fashion, home decor, and lifestyle essentials crafted with nature in mind. Elevate your style while supporting a greener future.',
};

export default function UserLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${poppins.className} ${roboto.className}`}>
                <Header />

                {children}

                <Footer />
            </body>
        </html>
    );
}
