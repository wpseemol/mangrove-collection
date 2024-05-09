'use client';

import { useAuth } from '@/app/hooks';
import { FaRegUser } from 'react-icons/fa6';
import NavLink from '../NavLink/NavLink';

export default function Account() {
    const [auth, setAuth] = useAuth();

    return (
        <li className="text-white">
            {' '}
            <NavLink href={auth ? '/account' : '/login'}>
                <div className="flex md:flex-row flex-col items-center sm:gap-3 gap-1">
                    <div className="text-primaryColor text-3xl">
                        <FaRegUser />
                    </div>
                    <div>
                        <h2 className="sm:text-lg text-sm font-semibold">
                            Account
                        </h2>
                        {auth ? (
                            <p className="text-sm hidden md:block">
                                {auth?.email}
                            </p>
                        ) : (
                            <p className="text-sm hidden md:block">
                                register or Login
                            </p>
                        )}
                    </div>
                </div>
            </NavLink>{' '}
        </li>
    );
}
