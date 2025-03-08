'use server';

import { UserRole } from '@/types/mongoose/user';
import { User } from 'next-auth';

const baseUrl = process.env.NEXT_PUBLIC_API_URL!;

export async function userRegister(
    registerUser: RegisterUserType
): Promise<UserRegister> {
    const response = await fetch(`${baseUrl}api/v1/user/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerUser),
    });

    // Parse response
    const isRegister: { message?: string } = await response.json();

    const registerObj: UserRegister = {
        message: isRegister.message || '',
        redirect: response.status === 201,
    };

    return registerObj;
}

interface RegisterUserType {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    conformPass: string;
    phone: string;
}

interface UserRegister {
    message: string;
    redirect: boolean;
}

export async function googolProviderUserCreate(
    googleLoginUserInfo: User
): Promise<GoogleUserType | null> {
    try {
        const response = await fetch(
            `${baseUrl}api/v1/user/google-provider-user-register`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: googleLoginUserInfo.name,
                    email: googleLoginUserInfo.email,
                    image: googleLoginUserInfo.image,
                }),
            }
        );

        if (response.ok) {
            const { data } = await response.json();
            return data;
        }

        return null;
    } catch (error) {
        console.log('googolProviderUserCreate error:', error);

        return null;
    }
}

interface GoogleUserType {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: UserRole;
}
