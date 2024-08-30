'use server';

import { signOut } from '@/auth/auth';
import { revalidatePath } from 'next/cache';

export default async function logoutAction(redirect = '/') {
    try {
        await signOut({
            redirectTo: redirect,
        });
        revalidatePath(redirect);
    } catch (error) {
        throw error;
    }
}
