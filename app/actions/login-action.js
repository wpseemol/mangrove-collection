'use server';

import { signIn } from '@/auth/auth';
import { AuthError } from 'next-auth';

export default async function loginAction(loginObj) {
    try {
        const isLogin = await signIn('credentials', {
            email: loginObj.email,
            password: loginObj.password,
            redirect: false,
        });

        return JSON.stringify({ message: 'user is login', response: isLogin });
    } catch (error) {
        if (error instanceof AuthError) {
            throw error;
        }
        throw error;
    }
}
