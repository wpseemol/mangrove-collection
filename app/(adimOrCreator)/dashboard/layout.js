import DashboardClientSite from '@/app/Components/Client/DashboardClientSite/DashboardClientSite';
import DashboardLoginUser from '@/app/Components/DashboardLoginUser/DashboardLoginUser';
import afterLogin from '@/app/actions/afterLogin/afterLogin';
import userType from '@/utils/userType';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }) {
    const loginUser = await afterLogin();

    const userTypeCake = userType(loginUser);

    if (userTypeCake?.type === 'admin') {
        return (
            <DashboardClientSite loginUser={<DashboardLoginUser />}>
                {children}
            </DashboardClientSite>
        );
    } else if (userTypeCake?.type === 'contentCreator') {
        return (
            <DashboardClientSite loginUser={<DashboardLoginUser />}>
                {children}
            </DashboardClientSite>
        );
    } else {
        redirect('/login');
    }
}
