'use client';

import { userLogout } from '@/app/actions/logout-action';
import { IoIosLogOut } from 'react-icons/io';

export default function DashboardLogout({ isDryerClose }) {
    async function handelLogout() {
        try {
            await userLogout();
        } catch (error) {
            throw error;
        }
    }

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
