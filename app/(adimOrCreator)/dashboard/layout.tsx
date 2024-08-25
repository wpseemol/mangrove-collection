import Btn from '@/app/(user)/account/_components/btn';
import '@/app/globals.css';
import { auth } from '@/auth/auth';
import { ADMIN, CREATOR } from '@/lib/constant-value';
import { Poppins, Roboto } from 'next/font/google';
import { redirect } from 'next/navigation';

const poppins = Poppins({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
});
const roboto = Roboto({ subsets: ['latin'], weight: ['400', '500', '700'] });

export const metadata = {
    title: 'Mangrove Collection | Home',
    description: 'Mangrove Collection is shopping project ',
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
                    {children}
                    <Btn />
                </body>
            </html>
        );
    } else {
        redirect('/account');
        return <></>;
    }
}
