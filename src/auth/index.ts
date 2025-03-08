import { userLogin } from '@/server/login';
import NextAuth, { CredentialsSignin } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, signIn, signOut, auth } = NextAuth({
    session: {
        strategy: 'jwt',
    },

    pages: {
        signIn: '/login',
        error: '/login/error',
    },

    trustHost: true,

    secret: process.env.AUTH_SECRET,

    providers: [
        Credentials({
            name: 'Credentials',
            type: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },

            async authorize(
                credentials:
                    | Partial<Record<'email' | 'password', unknown>>
                    | undefined
            ) {
                if (!credentials.email || !credentials.password) {
                    return null;
                }

                const credentialsEmail = credentials.email as string;
                const credentialsPassword = credentials.password as string;

                const response = await userLogin({
                    email: credentialsEmail,
                    password: credentialsPassword,
                });

                if (response.status === 201 && response.data) {
                    return response.data;
                }

                errorMessage = response.message;
                throw new InvalidLoginError();
            },
        }),
    ],
});

let errorMessage = 'Some thing is wrong.';

class InvalidLoginError extends CredentialsSignin {
    message = errorMessage;
    code = errorMessage;
    name = errorMessage;
    stack?: string | undefined = errorMessage;
    cause?: (Record<string, unknown> & { err?: Error }) | undefined;
}
