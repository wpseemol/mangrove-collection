'use server';

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
