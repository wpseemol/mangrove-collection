import afterLogin from '@/app/actions/afterLogin/afterLogin';
import '@/app/globals.css';
import AuthProvider from '@/components/Client/Providers/Auth/AuthProvider';
import NotificationProvider from '@/components/Client/Providers/NotificationProvider.jsx/NotificationProvider';
import Footer from '@/components/Footer/Footer';
import Header from '@/components/Header/Header';
import { Poppins, Roboto } from 'next/font/google';

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
        <html lang="en" className="scroll-smooth">
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
