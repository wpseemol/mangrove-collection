'use server';

import { signOut } from '@/auth';

export async function logoutWithServer() {
    await signOut({ redirect: true, redirectTo: '/' });
}
