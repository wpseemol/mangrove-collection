import client from '@/mongodb/connection/db';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { authCallbacks } from './callbacks';
import { providers } from './providers';

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: MongoDBAdapter(client),
    callbacks: authCallbacks,
    providers,
    pages: {
        signIn: '/login',
        error: '/login/error',
    },
    ...authConfig,
});
