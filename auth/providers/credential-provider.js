import { CredentialsSignin } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

const credentialsProvider = Credentials({
    name: 'Credentials',
    type: 'credentials',

    credentials: {
        email: { label: 'email' },
        password: { label: 'Password', type: 'password' },
    },
    async authorize(request) {
        try {
            const response = await fetch(
                `${process.env.BASE_URL_NAME}/api/auth/user/login`,
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

            console.log('auth credeantial provider:', response?.status);

            switch (response?.status) {
                case 404:
                    console.log('user is not fond');
                    throw new userNotFound();
                    break;
                case 401:
                    console.log('password not matchaing');
                    throw new passwordNotMatch();
                    break;

                default:
                    throw new somethingWrong();
                    break;
            }
        } catch (error) {
            console.log('next auth error show', error);
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
