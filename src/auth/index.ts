import { userLogin } from '@/server/login';
import { googolProviderUserCreate } from '@/server/user';
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

                errorMessage = response.message;
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

                const googleLoginUser = await googolProviderUserCreate(user);

                if (
                    googleLoginUser.status === 200 ||
                    googleLoginUser.status === 201
                ) {
                    if (googleLoginUser.data) {
                        user.id = googleLoginUser.data.id;
                        user.role = googleLoginUser.data.role;
                        return true;
                    }
                }

                errorMessage = googleLoginUser.message;
                throw new InvalidLoginError();
                return false;
            }

            return true;
        },
        // token, user, session, trigger
        async jwt({ token, user, session }) {
            if (user?.role) {
                token.role = user.role;
            }
            if (session?.role) {
                token.role = session.role;
            }

            return token;
        },

        async session({ session, token }) {
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
