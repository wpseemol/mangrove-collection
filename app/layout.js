import { Inter } from 'next/font/google';
import Footer from './Components/Footer/Footer';
import Header from './Components/Header/Header';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'Mangrove Collection | Home',
    description: 'Mangrove Collection is shopping project ',
};

export default function RootLayout({ children, modal }) {
    return (
        <html lang="en">
            <body className={inter.className} suppressHydrationWarning={true}>
                <Header />
                {modal}

                {children}
                <Footer />
            </body>
        </html>
    );
}
