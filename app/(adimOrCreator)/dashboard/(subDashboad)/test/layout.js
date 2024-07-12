import afterLogin from '@/app/actions/afterLogin/afterLogin';
import DashboardClientSite from '@/components/Client/DashboardClientSite/DashboardClientSite';
import DashboardLoginUser from '@/components/DashboardLoginUser/DashboardLoginUser';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }) {
    const loginUser = await afterLogin();

    return (
        <>
            {loginUser ? (
                <DashboardClientSite loginUser={<DashboardLoginUser />}>
                    {children}
                </DashboardClientSite>
            ) : (
                redirect('/login')
            )}
        </>
    );
}
