import DashboardClientSite from '@/components/Client/DashboardClientSite/DashboardClientSite';
import DashboardLoginUser from '@/components/DashboardLoginUser/DashboardLoginUser';

export default async function DashboardLayout({ children }) {
    return (
        <DashboardClientSite loginUser={<DashboardLoginUser />}>
            {children}
        </DashboardClientSite>
    );
}
