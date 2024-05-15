'use client';

import { IoIosLogOut } from 'react-icons/io';
import useLogout from '../LogOut/useLogout';

export default function DashboardLogout({ isDryerClose }) {
    const { handelLogout } = useLogout();
    return (
        <div className="flex justify-center">
            <button
                onClick={handelLogout}
                className="flex items-center justify-center gap-2 bg-slate-800/60 hover:bg-slate-800/80 p-3 rounded font-bold">
                <IoIosLogOut />
                <span className={isDryerClose ? 'md:hidden block' : 'block'}>
                    Log out
                </span>
            </button>
        </div>
    );
}
