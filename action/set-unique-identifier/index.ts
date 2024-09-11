'use server';

import { auth } from '@/auth/auth';
import { COOKIE_USER_ID } from '@/lib/constant-value';
import { cookies } from 'next/headers';

export default async function setCookiesUniqueIdentifier() {
    try {
        const session = await auth();

        if (!!session && getCookiesUserId()) {
            /**
             * when user is login;
             * or has cookies.
             */

            const response = await fetchCall({
                id: session.user.id,
                method: 'PATCH',
                visitorId: getCookiesUserId() as string,
                expires: null,
                isLogin: true,
            });

            if (response.status === 404) {
                await fetchCall({
                    method: 'POST',
                    visitorId: session.user.id,
                    expires: null,
                    // lastDeviceID: [getCookiesUserId()],
                    isLogin: true,
                });
                return;
            }

            // setUpdateDeletedCookies('', new Date(0)); // cookies deleted function
            return;
        }

        // if (!!session && !getCookiesUserId()) {
        //     const response = await fetchCall({
        //         id: session.user.id,
        //         method: 'PATCH',
        //         visitorId: session.user.id,
        //         expires: null,
        //         isLogin: true,
        //     });

        //     if (response.status === 404) {
        //         const isCreate = await fetchCall({
        //             method: 'POST',
        //             visitorId: session.user.id,
        //             expires: null,
        //         });

        //         return;
        //     }

        //     return;
        // }

        if (!(cookies().has(COOKIE_USER_ID) && getCookiesUserId())) {
            const value = crypto.randomUUID();
            setUpdateDeletedCookies(value, oneYearFromNow);
            await fetchCall({
                method: 'POST',
                visitorId: value,
                expires: oneYearFromNow,
            });

            return;
        }

        if (getCookiesUserId()) {
            /**
             * if has cookies userId value then patch request
             */
            const response = await fetchCall({
                id: getCookiesUserId() as string,
                method: 'PATCH',
                visitorId: getCookiesUserId() as string,
                expires: oneYearFromNow,
                isLogin: false,
            });

            if (response.status === 404) {
                await fetchCall({
                    method: 'POST',
                    visitorId: getCookiesUserId() as string,
                    expires: oneYearFromNow,
                });
                return;
            }

            return;
        }

        // setUpdateDeletedCookies('', new Date(0)); // cookies deleted function
    } catch (error) {}
}

async function fetchCall({
    id,
    deleteId,
    method,
    visitorId,
    expires,
    isLogin,
}: FetchCallType): Promise<Response> {
    const response = await fetch(
        `${process.env.SITE_BASE_URL!}/api/v1/visitor`,
        {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id,
                deleteId,
                visitorId,
                expires,
                isLogin,
            }),
        }
    );

    return response;
}

function setUpdateDeletedCookies(cookieValue: string, expires: Date) {
    const cookieStorage = cookies();
    cookieStorage.set(COOKIE_USER_ID, cookieValue, {
        path: '/',
        expires,
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
    });
}

function getCookiesUserId(key = COOKIE_USER_ID) {
    const cookieStorage = cookies();
    const cookieValue = cookieStorage.get(key)?.value;
    return cookieValue;
}

/**
 *  POST request idLogin or id is Optional
 */
type FetchCallType = {
    method: 'PATCH' | 'POST';
    visitorId: string;
    deleteId?: string;
    expires: Date | null;
    isLogin?: boolean;
    id?: string;
};

const oneYearFromNow = new Date();
oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
