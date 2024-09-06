'use server';

import { cookies } from 'next/headers';

export default async function setCookiesUniqueIdentifier() {
    const cookieStorage = cookies();

    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    if (!cookieStorage.has('_unique_id')) {
        cookieStorage.set('_unique_id', crypto.randomUUID(), {
            path: '/',
            expires: oneYearFromNow, // 1 year from now
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
        });
    } else {
        const cookieValue = cookieStorage.get('_unique_id')?.value;

        console.log('get cookie value', cookieValue);

        if (cookieValue) {
            // Update the cookie with the new maxAge
            cookieStorage.set('_unique_id', cookieValue, {
                path: '/',
                expires: oneYearFromNow, // 1 year from now
                httpOnly: true,
                secure: true,
                sameSite: 'lax',
            });
        }
    }

    return { message: 'successful!' };
}
