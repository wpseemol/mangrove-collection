import { Inter } from 'next/font/google';
import NotificationProvider from './Components/Client/Providers/NotificationProvider.jsx/NotificationProvider';
import Footer from './Components/Footer/Footer';
import Header from './Components/Header/Header';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'Mangrove Collection | Home',
    description: 'Mangrove Collection is shopping project ',
};

export default async function RootLayout({ children, modal }) {
    return (
        <html lang="en">
            <body className={inter.className} suppressHydrationWarning={true}>
                <NotificationProvider>
                    <Header />
                    {modal}
                    {children}
                    <Footer />
                </NotificationProvider>
            </body>
        </html>
    );
}
