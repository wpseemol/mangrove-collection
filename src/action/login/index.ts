'use server';

import { signIn } from '@/auth';

export async function loginWithServer(
    provider: string,
    options?: OptionType
): Promise<{
    error?: string;
    status?: number;
    ok: boolean;
    url?: string;
} | void> {
    return await signIn(provider, options);
}

interface OptionType {
    redirect: boolean;
    redirectTo: string;
}
