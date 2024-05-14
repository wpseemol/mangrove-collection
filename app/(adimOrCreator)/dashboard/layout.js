import afterLogin from '@/app/actions/afterLogin/afterLogin';
import userType from '@/utils/userType';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }) {
    const loginUser = await afterLogin();

    const userTypeCake = userType(loginUser);

    if (userTypeCake?.type === 'admin') {
        return children;
    } else if (userTypeCake?.type === 'contentCreator') {
        return children;
    } else {
        redirect('/login');
    }
}
