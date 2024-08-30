import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { authCallbacks } from './callbacks';
import { providers } from './providers';

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers,
    callbacks: authCallbacks,
    pages: {
        signIn: '/login',
        error: '/login/error',
    },
});
