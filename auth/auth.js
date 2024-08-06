import client from '@/mongodb/connection/db';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { providers } from './providers';

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    adapter: MongoDBAdapter(client),
    providers,
});
