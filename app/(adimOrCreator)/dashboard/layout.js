import { auth } from '@/auth/auth';
import DashboardClientSite from '@/components/Client/DashboardClientSite/DashboardClientSite';
import DashboardMenuUser from '@/components/DashboardLoginUser/dashboard-menu-user';

export default async function DashboardLayout({ children }) {
    const session = await auth();

    // if (session?.use?.role === USER) {
    //     redirect('/account');
    //     return;
    // }

    return (
        <DashboardClientSite
            user={session?.user}
            userMenu={<DashboardMenuUser user={session?.user} />}>
            {children}
        </DashboardClientSite>
    );
}
