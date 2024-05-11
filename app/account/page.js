import { notFound } from 'next/navigation';
import LogOut from '../Components/Client/LogOut/LogOut';
import afterLogin from '../actions/afterLogin/afterLogin';

export default async function AccountPage() {
    const loginUser = await afterLogin();

    if (!loginUser) {
        notFound();
    }

    return (
        <>
            {!!loginUser && (
                <div className="text-center h-[calc(100vh-28.2rem)] text-xl mt-8">
                    hello{' '}
                    <span className="font-bold">{loginUser?.fullName}</span>{' '}
                    welcome to our shop
                    <LogOut />
                </div>
            )}
        </>
    );
}
