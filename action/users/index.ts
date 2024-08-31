'use server';

import { BaseUserType } from '@/types/mongoose-models';
import { cookies } from 'next/headers';

export default async function getUsers() {
    try {
        const cookieStore = cookies();
        const allCookies = cookieStore
            .getAll()
            .map((cookie) => `${cookie.name}=${cookie.value}`)
            .join('; ');

        const response = await fetch(
            `${process.env.SITE_BASE_URL!}/api/v1/users`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: allCookies,
                },
            }
        );

        const data: { users: BaseUserType[] } = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
}
