import Btn from '@/app/(user)/account/_components/btn';
import '@/app/globals.css';
import { auth } from '@/auth/auth';
import { ADMIN, CREATOR } from '@/lib/constant-value';
import { Poppins, Roboto } from 'next/font/google';
import { redirect } from 'next/navigation';
import DashboardMenuLayout from './_components/dashboard-menu-layout';
import DashboardLoginUser from './_components/dashboard-menu-login-user';

const poppins = Poppins({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
});
const roboto = Roboto({ subsets: ['latin'], weight: ['400', '500', '700'] });

export const metadata = {
    title: 'Dashboard | Mangrove Collection',
    description:
        'Mangrove Collection is shopping project Backend Boar layout start.',
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth();

    const admin = session?.user.role === ADMIN;
    const creator = session?.user.role === CREATOR;

    if (admin || creator) {
        return (
            <html lang="en" className="scroll-smooth">
                <body
                    className={poppins.className + ' ' + roboto.className}
                    suppressHydrationWarning={true}>
                    <DashboardMenuLayout
                        user={session?.user}
                        userMenu={<DashboardLoginUser />}>
                        {children}
                    </DashboardMenuLayout>
                    <Btn />
                </body>
            </html>
        );
    } else {
        redirect('/account');
        return <></>;
    }
}
