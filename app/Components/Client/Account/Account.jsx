'use client';

import { useAuth } from '@/app/hooks';
import { FaRegUser } from 'react-icons/fa6';
import NavLink from '../NavLink/NavLink';

export default function Account({ loginUser }) {
    const [auth, setAuth, authLoading, setAuthLoading] = useAuth();

    const firstName = loginUser?.fullName.split(' ')[0];

    const type = userType(auth);

    let linkUrl;
    if (type === '/dashboard') {
        linkUrl = 'Admin';
    } else if (type === 'admin') {
        linkUrl = '/dashboard';
    } else {
        linkUrl = '/account';
    }

    return (
        <li className="text-white">
            {authLoading ? (
                <p>loading...</p>
            ) : (
                <NavLink href={auth ? linkUrl : '/login'}>
                    <div className="flex md:flex-row flex-col items-center xl:gap-3 md:gap-2 gap-1">
                        <div className="text-primaryColor lg:text-3xl text-xl">
                            <FaRegUser />
                        </div>
                        <div>
                            <h2 className="lg:2xl md:text-xl text-sm font-semibold">
                                Account
                            </h2>
                            {auth ? (
                                <p className="text-sm hidden md:block">
                                    {firstName}
                                </p>
                            ) : (
                                <p className="text-sm hidden md:block">
                                    register or Login
                                </p>
                            )}
                        </div>
                    </div>
                </NavLink>
            )}
        </li>
    );
}
