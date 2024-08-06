'use server';

import { signOut } from '@/auth/auth';

export async function userLogout(redirectUrl = '/') {
    await signOut({ redirectTo: redirectUrl });
}
