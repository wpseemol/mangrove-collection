'use server';

import { signIn } from '@/auth/auth';

export default async function loginAction(loginObj) {
    try {
        const isLogin = await signIn('credentials', {
            email: loginObj.email,
            password: loginObj.password,
            redirect: false,
        });

        return JSON.stringify({ message: 'user is login', response: isLogin });
    } catch (error) {
        throw error;
    }
}
