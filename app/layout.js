import { Inter } from 'next/font/google';
import Footer from './Components/Footer/Footer';
import Header from './Components/Header/Header';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'Mangrove Collection | Home',
    description: 'Mangrove Collection is shopping project ',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={inter.className} suppressHydrationWarning={true}>
                <Header />
                {children}
                <Footer />
            </body>
        </html>
    );
}
