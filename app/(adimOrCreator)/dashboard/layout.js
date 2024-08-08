import { auth } from '@/auth/auth';
import DashboardClientSite from '@/components/Client/DashboardClientSite/DashboardClientSite';

export default async function DashboardLayout({ children }) {
    const session = await auth();

    // if (session?.use?.role === USER) {
    //     redirect('/account');
    //     return;
    // }

    return (
        <DashboardClientSite user={session?.user}>
            {children}
        </DashboardClientSite>
    );
}
