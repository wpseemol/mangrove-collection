import { auth } from '@/auth/auth';
import { USER } from '@/constant-value';
import { redirect } from 'next/navigation';
import LogOut from '../../../components/Client/LogOut/LogOut';

export default async function AccountPage() {
    const session = await auth();

    if (!session?.user) redirect('/');

    if (session?.user?.role !== USER) redirect('/dashboard');
    return (
        <>
            <div>
                <h2 className="text-center font-bold text-3xl m-3">
                    {session?.user?.name}
                </h2>
            </div>
            <div className="text-center h-[calc(100vh-28.2rem)] text-xl mt-8">
                Welcome to our shop
                <LogOut />
            </div>
        </>
    );
}
