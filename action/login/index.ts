'use server';

import { signIn } from '@/auth/auth';
import { AuthError } from 'next-auth';
import { revalidatePath } from 'next/cache';

export default async function loginAction(
    loginObj: LoginActionType,
    redirect = '/'
) {
    try {
        const isLogin = await signIn('credentials', {
            ...loginObj,
            redirectTo: redirect,
            redirect: true,
        });

        revalidatePath('/');
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
