import { auth } from '@/auth/auth';
import DashboardClientSite from '@/components/Client/DashboardClientSite/DashboardClientSite';
import { USER } from '@/constant-value';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }) {
    const session = await auth();

    if (session?.use?.role === USER) {
        redirect('/account');
        return;
    }

    return <DashboardClientSite>{children}</DashboardClientSite>;
}
