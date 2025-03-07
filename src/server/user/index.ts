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

    const { message } = await response.json();

    if (response.ok) {
        return {
            message,
            redirect: true,
        };
    }

    return {
        message,
        redirect: false,
    };
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
    massage: string;
    redirect: boolean;
}
