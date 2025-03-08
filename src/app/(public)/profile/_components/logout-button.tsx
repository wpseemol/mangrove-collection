'use client';
import { logoutWithServer } from '@/action/logout';

export default function LogoutButton() {
    async function handelLogout() {
        await logoutWithServer();
    }

    return <button onClick={handelLogout}>logout</button>;
}
