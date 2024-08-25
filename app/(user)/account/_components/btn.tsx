'use client';

import logoutAction from '@/action/logout';
import { Button } from '@/components/ui/button';

export default function Btn() {
    async function handelClick() {
        await logoutAction();
    }

    return (
        <>
            <Button onClick={handelClick} className="mt-5">
                logout
            </Button>
        </>
    );
}
