'use server';

import { signOut } from '@/auth/auth';
import { revalidatePath } from 'next/cache';

export default async function logoutAction(redirectTo = '/') {
    try {
        await signOut({
            redirectTo,
        });
        revalidatePath(redirectTo);
    } catch (error) {
        throw error;
    }
}
