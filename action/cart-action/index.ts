'use server';

import { auth } from '@/auth/auth';
import { COOKIE_USER_ID } from '@/lib/constant-value';
import { cookies } from 'next/headers';

export async function cartAction(productId: string) {
    try {
        const session = await auth();
        const cookieStorage = cookies();
        const cookieValue = cookieStorage.get(COOKIE_USER_ID)?.value;

        if (session) {
            /**
             * if user is login do this action
             */
            const response = await fetch(
                `${process.env.SITE_BASE_URL}/api/v1/cart`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        productId,
                        userId: session.user.id,
                        isLogin: true,
                    }),
                }
            );

            return { message: 'User is login so user info' };
        }

        if (!cookieValue) {
            return {
                message: 'Cookie value is Required when user is not login',
            };
        }

        if (!session) {
            const response = await fetch(
                `${process.env.SITE_BASE_URL}/api/v1/cart`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ productId, userId: cookieValue }),
                }
            );

            return { message: 'Successful cart product add.' };
        }
    } catch (error) {
        throw error;
    }
}

export async function afterLoginUserCartUpdate() {}
