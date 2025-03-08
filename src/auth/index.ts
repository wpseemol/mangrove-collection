import { userLogin } from '@/server/login';
import NextAuth, { CredentialsSignin } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

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
                if (!credentials?.email || !credentials?.password) {
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

                if (response.message) errorMessage = response.message;
                throw new InvalidLoginError();
            },
        }),

        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],

    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === 'google') {
                // do some thing.
            }

            console.log('--------------------------');
            console.log('singIn user:', user);
            // console.log('singIn account:', account);
            // console.log('singIn profile:', profile);
            // user.id = 'some text test';
            console.log('--------------------------');
            throw new InvalidLoginError();
            return false;
        },
        // token, user, session, trigger
        async jwt({ token, user, session }) {
            // console.log('----------------------------');
            // console.log('jwt token:', token);
            // console.log('jwt user:', user);
            // console.log('jwt session:', session);
            // console.log('----------------------------');

            if (user?.role) {
                token.role = user.role;
            }
            if (session?.role) {
                token.role = session.role;
            }

            return token;
        },

        async session({ session, token }) {
            // console.log('----------------------------');
            // console.log('session session:', session);
            // console.log('session token:', token);
            // console.log('----------------------------');

            if (token.role) {
                session.user.role = token.role;
            }

            if (token.sub) {
                session.user.id = token.sub;
            }

            return session;
        },
    },
});

let errorMessage = 'Some thing is wrong.';

class InvalidLoginError extends CredentialsSignin {
    message = errorMessage;
    code = errorMessage;
    name = errorMessage;
    stack?: string | undefined = errorMessage;
    cause?: (Record<string, unknown> & { err?: Error }) | undefined;
}
