import afterLogin from '@/app/actions/afterLogin/afterLogin';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }) {
    const loginUser = await afterLogin();

    return <>{loginUser ? children : redirect('/login')}</>;
}
