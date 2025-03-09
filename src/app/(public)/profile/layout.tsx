import { auth } from '@/auth';
import { USER } from '@/lib/constant';
import { notFound } from 'next/navigation';

export default async function ProfileLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth();

    if (session?.user.role === USER) {
        return <>{children}</>;
    }

    notFound();

    return <></>;
}
