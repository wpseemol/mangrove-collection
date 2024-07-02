import userType from '@/utils/userType';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import LogOut from '../Components/Client/LogOut/LogOut';
import afterLogin from '../actions/afterLogin/afterLogin';

export default async function AccountPage() {
    const loginUser = await afterLogin();

    if (!loginUser) {
        notFound();
    }

    const { status, type } = userType(loginUser); // this function is cake for user type

    if (status && type === 'admin') {
        return (
            <>
                <div>
                    <h2 className="text-center font-bold text-3xl m-3">
                        You are admin
                    </h2>
                </div>
                <div className="text-center h-[calc(100vh-28.2rem)] text-xl mt-8">
                    hello{' '}
                    <span className="font-bold">{loginUser?.fullName}</span>{' '}
                    welcome to our shop
                    <LogOut />
                </div>
            </>
        );
    } else if (status && type === 'contentCreator') {
        return (
            <>
                <div>
                    <h2 className="text-center font-bold text-3xl m-3">
                        You are Content Creator
                    </h2>
                </div>
                <div className="text-center h-[calc(100vh-28.2rem)] text-xl mt-8">
                    hello{' '}
                    <span className="font-bold">{loginUser?.fullName}</span>{' '}
                    welcome to our shop
                    <LogOut />
                </div>
            </>
        );
    } else if (status) {
        return (
            <div className="text-center h-[calc(100vh-28.2rem)] text-xl mt-8">
                hello <span className="font-bold">{loginUser?.fullName}</span>{' '}
                welcome to our shop
                <LogOut />
            </div>
        );
    } else {
        return (
            <div>
                please go to login
                <Link href={'/login'}>login</Link>
            </div>
        );
    }
}
