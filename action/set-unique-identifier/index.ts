'use server';

import { auth } from '@/auth/auth';
import { COOKIE_USER_ID } from '@/lib/constant-value';
import { cookies } from 'next/headers';

export default async function setCookiesUniqueIdentifier() {
    try {
        const session = await auth();
        const cookieStorage = cookies();

        if (!!session) {
            const cookieValue = cookieStorage.get(COOKIE_USER_ID)?.value;
            if (cookieValue) {
                const response = await fetch(
                    `${process.env.SITE_BASE_URL!}/api/v1/visitor`,
                    {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            id: cookieValue,
                            visitorId: session.user.id,
                            expires: null,
                            isLogin: true,
                        }),
                    }
                );

                if (response.ok) {
                    cookieStorage.set(COOKIE_USER_ID, '', {
                        path: '/',
                        expires: new Date(0), // Set to a date in the past
                        httpOnly: true,
                        secure: true,
                        sameSite: 'lax',
                    });
                }
            }

            return { message: 'successful cookies deleted!' };
        }

        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

        if (!cookieStorage.has(COOKIE_USER_ID)) {
            cookieStorage.set(COOKIE_USER_ID, crypto.randomUUID(), {
                path: '/',
                expires: oneYearFromNow, // 1 year from now
                httpOnly: true,
                secure: true,
                sameSite: 'lax',
            });
            const cookieValue = cookieStorage.get(COOKIE_USER_ID)?.value;
            if (cookieValue) {
                const response = await fetch(
                    `${process.env.SITE_BASE_URL!}/api/v1/visitor`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            visitorId: cookieValue,
                            expires: oneYearFromNow,
                        }),
                    }
                );
            }

            return {
                message:
                    'successful cookies created and set data base cookies value!',
            };
        } else {
            const cookieValue = cookieStorage.get(COOKIE_USER_ID)?.value;

            if (cookieValue) {
                // Update the cookie with the new maxAge
                cookieStorage.set(COOKIE_USER_ID, cookieValue, {
                    path: '/',
                    expires: oneYearFromNow, // 1 year from now
                    httpOnly: true,
                    secure: true,
                    sameSite: 'lax',
                });

                const response = await fetch(
                    `${process.env.SITE_BASE_URL!}/api/v1/visitor`,
                    {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            id: cookieValue,
                            visitorId: cookieValue,
                            expires: oneYearFromNow,
                            isLogin: false,
                        }),
                    }
                );
            }

            return { message: 'successful update data base!' };
        }
    } catch (error) {}

    return { message: 'successful!' };
}
