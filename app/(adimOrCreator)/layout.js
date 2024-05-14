import AuthProvider from '@/app/Components/Client/Providers/Auth/AuthProvider';
import NotificationProvider from '@/app/Components/Client/Providers/NotificationProvider.jsx/NotificationProvider';
import Header from '@/app/Components/Header/Header';
import afterLogin from '@/app/actions/afterLogin/afterLogin';
import '@/app/globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'Mangrove Collection | Home',
    description: 'Mangrove Collection is shopping project ',
};

export default async function RootLayout({ children }) {
    const loginUser = await afterLogin();

    return (
        <html lang="en">
            <body className={inter.className} suppressHydrationWarning={true}>
                <AuthProvider loginUser={loginUser}>
                    <NotificationProvider>
                        <Header />
                        {children}
                    </NotificationProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
