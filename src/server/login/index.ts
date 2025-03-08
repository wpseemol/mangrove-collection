'use server';

const baseUrl = process.env.NEXT_PUBLIC_API_URL!;

export async function userLogin(
    loginCredential: LoginCredentialType
): Promise<LoginUserDetailsType> {
    const response = await fetch(`${baseUrl}api/v1/user/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginCredential),
    });

    const isRegister = await response.json();

    if (response.ok) {
        return {
            message: isRegister?.message,
            redirect: true,
        };
    }

    return {
        message: isRegister?.message,
        redirect: false,
    };
}

interface LoginCredentialType {
    email: string;
    password: string;
}

interface LoginUserDetailsType {
    message: string;
    status: boolean;
    data: UserType;
}

interface UserType {
    id: string;
    fullName: string;
    email: string;
    role: 'admin' | 'user' | 'creator';
    username: string;
}
