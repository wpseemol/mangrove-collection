'use client';
import { logoutWithServer } from '@/action/logout';
import { Button } from '@/components/ui/button';

export default function LogoutButton() {
    async function handelLogout() {
        await logoutWithServer();
    }

    return (
        <Button onClick={handelLogout} className="text-white">
            logout
        </Button>
    );
}
