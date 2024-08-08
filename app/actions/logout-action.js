'use server';

import { signOut } from '@/auth/auth';
import { revalidatePath } from 'next/cache';

export async function userLogout(redirectUrl = '/') {
    await signOut({ redirectTo: redirectUrl });
    revalidatePath(redirectUrl);
}
