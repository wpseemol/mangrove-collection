'use client';

import { userLogout } from '@/app/actions/logout-action';

export default function LogOut() {
    async function handelLogout() {
        await userLogout();
    }

    return (
        <div>
            <button
                onClick={handelLogout}
                className="bg-red-400 text-white px-4 py-3 rounded shadow-red-800">
                Logout
            </button>
        </div>
    );
}
