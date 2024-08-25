import Credentials from '@auth/core/providers/credentials';
import { CredentialsSignin } from 'next-auth';

const credentialsProvider = Credentials({
    name: 'Credentials',
    type: 'credentials',

    credentials: {
        email: { label: 'Email' },
        password: { label: 'Password', type: 'password' },
    },

    async authorize(request) {
        try {
            const response = await fetch(
                `${process.env.VERCEL_URL}/api/v1/user/login`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(request),
                }
            );

            if (response.ok) {
                const loginUser = await response.json();

                return loginUser?.user;
            }

            // console.log('credential providers:', response);

            switch (response?.status) {
                case 404:
                    throw new userNotFound();

                case 401:
                    throw new passwordNotMatch();

                default:
                    throw new somethingWrong();
            }
        } catch (error) {
            throw error;
        }
    },
});

export { credentialsProvider };

class passwordNotMatch extends CredentialsSignin {
    message = 'Password is not match';
}
class userNotFound extends CredentialsSignin {
    message = 'User account is not found.';
}
class somethingWrong extends CredentialsSignin {
    message = 'Some thing is wrong.';
}
