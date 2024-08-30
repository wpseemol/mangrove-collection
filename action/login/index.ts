'use server';

import { signIn } from '@/auth/auth';
import { AuthError } from 'next-auth';

export default async function loginAction(
    loginObj: LoginActionType,
    redirect = '/'
) {
    try {
        const isLogin = await signIn('credentials', {
            ...loginObj,
            redirectTo: redirect,
        });

        return JSON.stringify({ message: 'user is login', response: isLogin });
    } catch (error) {
        if (error instanceof AuthError) {
            throw error;
        }
        throw error;
    }
}

/**
 * for login pass email or password.
 */
interface LoginActionType {
    email: string;
    password: string;
}
