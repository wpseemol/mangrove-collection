import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { providers } from './providers';

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers,
    pages: {
        signIn: '/login',
        error: '/login/error',
    },
});
