'use server';

import { auth } from '@/auth/auth';
import { COOKIE_USER_ID } from '@/lib/constant-value';
import { cookies } from 'next/headers';

export async function cartAction() {
    const session = await auth();
    const cookieStorage = cookies();
    const cookieValue = cookieStorage.get(COOKIE_USER_ID)?.value;

    if (session) {
        /**
         * if user is login do this action
         */

        return { message: 'User is login so user info' };
    }

    if (cookieValue) {
        return { message: 'Cookie value is Required when user is not login' };
    }

    if (!session) {
        return { message: 'Successful cart product add.' };
    }
}
