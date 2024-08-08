'use client';

import { userLogout } from '@/app/actions/logout-action';
import { useRouter } from 'next/navigation';

export default function LogOut() {
    const router = useRouter();
    async function handelLogout() {
        try {
            await userLogout('/');
            router.refresh();
        } catch (error) {
            throw error;
        }
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
