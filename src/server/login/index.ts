'use server';

const baseUrl = process.env.NEXT_PUBLIC_API_URL!;

export async function userLogin(
    loginCredential: LoginCredentialType
): Promise<LoginUserDetailsType> {
    const loginUserInfo: LoginUserDetailsType = {
        message: 'Some thing is wrong.',
        status: 500,
        data: null,
    };

    try {
        const response = await fetch(`${baseUrl}api/v1/user/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginCredential),
        });

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
        console.log('Login error:', error);
        return loginUserInfo;
    }
}

interface LoginCredentialType {
    email: string;
    password: string;
}

interface LoginUserDetailsType {
    message: string;
    status: number | string;
    data: UserType | null;
}

interface UserType {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'creator';
    image: string | null;
}
