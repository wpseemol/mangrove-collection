import AuthProvider from '@/app/Components/Client/Providers/Auth/AuthProvider';
import NotificationProvider from '@/app/Components/Client/Providers/NotificationProvider.jsx/NotificationProvider';
import Footer from '@/app/Components/Footer/Footer';
import Header from '@/app/Components/Header/Header';
import afterLogin from '@/app/actions/afterLogin/afterLogin';
import { Poppins, Roboto } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
});
const roboto = Roboto({ subsets: ['latin'], weight: ['400', '500', '700'] });

export const metadata = {
    title: 'Mangrove Collection | Home',
    description: 'Mangrove Collection is shopping project ',
};

export default async function RootLayout({ children, modal }) {
    const loginUser = await afterLogin();

    return (
        <html lang="en">
            <body
                className={poppins.className + ' ' + roboto.className}
                suppressHydrationWarning={true}>
                <AuthProvider loginUser={loginUser}>
                    <NotificationProvider>
                        <Header />
                        {modal}
                        {children}
                        <Footer />
                    </NotificationProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
