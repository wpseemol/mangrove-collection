import { auth } from '@/auth/auth';
import { notFound } from 'next/navigation';
import LogOut from '../../../components/Client/LogOut/LogOut';

export default async function AccountPage() {
    const { user } = await auth();

    if (!user) {
        notFound();
    }

    return (
        <>
            <div>
                <h2 className="text-center font-bold text-3xl m-3">
                    {user?.name}
                </h2>
            </div>
            <div className="text-center h-[calc(100vh-28.2rem)] text-xl mt-8">
                Welcome to our shop
                <LogOut />
            </div>
        </>
    );
}
