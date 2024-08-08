import { auth } from '@/auth/auth';

export default async function DashboardLayout({ children }) {
    const { section } = await auth();

    return <>{children}</>;

    // const userTypeCake = userType(loginUser);

    // if (userTypeCake?.type === 'admin') {
    //     return (
    //         <DashboardClientSite loginUser={<DashboardLoginUser />}>
    //             {children}
    //         </DashboardClientSite>
    //     );
    // } else if (userTypeCake?.type === 'contentCreator') {
    //     return (
    //         <DashboardClientSite loginUser={<DashboardLoginUser />}>
    //             {children}
    //         </DashboardClientSite>
    //     );
    // } else {
    //     redirect('/login');
    // }
}
