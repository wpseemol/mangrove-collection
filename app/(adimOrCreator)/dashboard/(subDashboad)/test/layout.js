import DashboardClientSite from '@/app/Components/Client/DashboardClientSite/DashboardClientSite';
import DashboardLoginUser from '@/app/Components/DashboardLoginUser/DashboardLoginUser';
import afterLogin from '@/app/actions/afterLogin/afterLogin';
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
