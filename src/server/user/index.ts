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
): Promise<GoogleUserType> {
    const loginUserInfo: GoogleUserType = {
        message: 'Some thing is wrong',
        status: 500,
        data: null,
    };
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

        loginUserInfo.status = response.status;

        const responseData = await response.json();
        if (responseData.message) {
            const responseMessage = responseData.message as string;
            loginUserInfo.message = responseMessage;
        }

        if (responseData.data) {
            loginUserInfo.data = responseData.data;
        }

        return loginUserInfo;
    } catch (error) {
        console.log('googolProviderUserCreate error:', error);

        return loginUserInfo;
    }
}

interface GoogleUserType {
    message: string;
    status: number | string;
    data: UserType | null;
}

interface UserType {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: UserRole;
}
