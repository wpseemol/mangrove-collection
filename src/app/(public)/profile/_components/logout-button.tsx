'use client';
import { logOut } from '@/action/logout';

export default function LogoutButton() {
    async function handelLogout() {
        await logOut();
    }

    return <button onClick={handelLogout}>logout</button>;
}
