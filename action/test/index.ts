'use server';

import { cookies } from 'next/headers';

// import { getServerSession } from 'next-auth/next';

export async function test() {
    cookies().set('_unique_id', crypto.randomUUID(), {
        path: '/',
        maxAge: 100, // 30 days
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
    });
    return { message: 'successful!' };
}
