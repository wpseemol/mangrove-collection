'use client';

import useLogout from './useLogout';

export default function LogOut() {
    const { handelLogout } = useLogout();

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
